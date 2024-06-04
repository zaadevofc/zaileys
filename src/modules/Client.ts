import {
  DisconnectReason,
  makeInMemoryStore,
  makeWASocket,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import chalk from "chalk";
import pino from "pino";
import { ActionsProps, ClientProps, Prettify } from "../types";
import { ConnectionConfig, delay, fetchJson, loop } from "../utils";
import { InitDisplay } from "./Display";
import { MessageParser } from "./Parser";
import { socket } from "./Socket";
import { version } from '../../package.json'

/**
 * Client class for WhatsApp Web connection
 */
export class Client {
  /**
   * If the client is in pairing mode
   */
  public readonly pairing: boolean;
  /**
   * Phone number of the client
   */
  public readonly phoneNumber: number;
  /**
   * If the client should show logs
   */
  public readonly showLogs: boolean;
  /**
   * Authorized phone numbers of the client
   */
  public readonly authors: number[];

  private socket = socket;
  private store: ReturnType<typeof makeInMemoryStore> | undefined;
  private state: any;
  private me: any;

  /**
   * Constructor for the client
   * @param {ClientProps} props - The client properties
   */
  constructor({ pairing, phoneNumber, showLogs, authors }: ClientProps) {
    this.pairing = pairing ?? true;
    this.phoneNumber = phoneNumber;
    this.showLogs = showLogs ?? true;
    this.authors = authors ?? [];

    this.client();
  }

  /**
   * Setter for the client state
   * @param {any} state - The state to set
   */
  set saveState(state: any) {
    this.state = state;
  }

  /**
   * Client connection initialization
   * @returns {Promise<WASocket>} - The socket connection
   */
  private async client() {
    InitDisplay(this as never);

    // Initialize store and auth state
    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) as any });
    const { state, saveCreds } = await useMultiFileAuthState("session/zaileys");
    store.readFromFile("session/data.json");

    // Write to file periodically
    loop(async () => {
      try {
        store.writeToFile("session/data.json");
      } catch (error) {
        await this.socket.emit('conn_msg', ['fail', chalk.yellow(`[DETECTED] session folder has been deleted by the user`)]);
        await delay(2000);
        await this.socket.emit('conn_msg', ['fail', chalk.yellow(`Please rerun the program...`)]);
        await process.exit();
      }
    }, 10_000);

    this.state = state;
    this.store = store;

    // Initialize socket connection
    const sock = makeWASocket(ConnectionConfig(this as never));
    store.bind(sock.ev);

    // Initialize new session
    if (this.pairing && this.phoneNumber && !state.creds.me && !sock.authState.creds.registered) {
      this.socket.emit('conn_msg', ['start', 'Initialization new session...']);
      await delay(2000);
      this.socket.emit('conn_msg', ['start', `Creating new pairing code...`]);
      await delay(6000);
      const code = await sock.requestPairingCode(this.phoneNumber.toString());
      this.socket.emit('conn_msg', ['info', `Connect with pairing code : ${chalk.green(code)}`]);
    }

    // Message event handler
    sock.ev.on('messages.upsert', async (m) => {
      this.socket.emit('act_message', m.messages);
    });

    // Latest version check
    let lts: any = await fetchJson('https://registry.npmjs.org/-/package/zaileys/dist-tags');
    sock.ev.process(async (ev) => {
      if (ev["creds.update"]) {
        let data = ev["creds.update"];
        if (data && lts) {
          this.socket.emit('conn_config', [
            chalk`{greenBright → Login as       :} {redBright ${data.me?.verifiedName || data.me?.name}}`,
            chalk`{greenBright → Login Platform :} {cyanBright ${data.platform}}`,
            chalk`{greenBright → Creds Phone    :} {magentaBright ${data.phoneId}}`,
            chalk`{greenBright → Creds Device   :} {magentaBright ${data.deviceId}}`,
            chalk`{greenBright → Libs Current   :} {yellowBright zaileys@${version}}`,
            chalk`{greenBright → Libs Latest    :} {${lts?.latest == version ? 'yellowBright' : 'magenta'} zaileys@${lts?.latest}} {red ${lts?.latest == version ? '' : 'new version'}}`,
            '',
          ]);
        }
        await saveCreds();
      };

      // Connection update event handler
      if (ev["connection.update"]) {
        const update = ev["connection.update"];
        const { connection, lastDisconnect, qr } = update;

        if (connection == 'connecting') {
          this.socket.emit('act_connection', 'connecting');
          this.socket.emit('conn_msg', ['start', 'Connecting to server...']);
        }

        if (qr) {
          this.socket.emit('conn_msg', ['warn', 'Please scan the QR code...']);
        }

        if (connection === "close") {
          this.socket.emit('act_connection', 'close');
          const last: any = lastDisconnect?.error;
          const isReconnect = last?.output.statusCode !== DisconnectReason.loggedOut;

          if (isReconnect) {
            await this.socket.emit('conn_msg', ['warn', 'Failed to connect. Waiting for reconnect...']);
            await this.client();
          }

          if (last?.output.statusCode == DisconnectReason.connectionReplaced) {
            await this.socket.emit('conn_msg', ['fail', chalk`{redBright Connection was lost because the same session was in use!}`]);
            await process.exit(0);
          }

          if (last?.output.statusCode == DisconnectReason.loggedOut || last?.output.statusCode == DisconnectReason.badSession) {
            this.socket.emit('conn_msg', ['fail', 'Failed to connect. Please delete session and try again.']);
            return;
          }

          await this.socket.emit('conn_msg', ['info', 'Trying to reconnect...']);
          await delay(2000);
          await this.socket.emit('conn_msg', ['clear']);
        }

        if (connection === "open") {
          this.socket.emit('act_connection', 'ready');
          this.socket.emit('conn_msg', ['succeed', 'Connected to server']);
          console.log();
        }
      }
    });

    return sock;
  }

  /**
   * Event handler for specific actions
   * @param {T} actions - The actions to listen to
   * @param {(ctx: Prettify<ActionsProps[T]>) => void} callback - The callback function
   */
  on<T extends keyof ActionsProps>(actions: T, callback: (ctx: Prettify<ActionsProps[T]>) => void) {
    const call = (name: string, cb: (x: any) => void) => this.socket.on(`act_${name}`, cb);

    switch (actions) {
      case 'connection':
        call(actions, (msg) => callback(msg));
        break;

      case 'message':
        call(actions, async (msg) => callback(MessageParser(msg, this as any) as any));
        break;
    }
  }
}
