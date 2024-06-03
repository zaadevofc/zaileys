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
import pkg from '../../package.json'

export class Client {
  public readonly pairing: boolean;
  public readonly phoneNumber: number;
  public readonly showLogs: boolean;
  public readonly authors: number[];

  private socket = socket;
  private store: ReturnType<typeof makeInMemoryStore> | undefined;
  private state: any;
  private me: any;

  constructor({ pairing, phoneNumber, showLogs, authors }: ClientProps) {
    this.pairing = pairing ?? true;
    this.phoneNumber = phoneNumber;
    this.showLogs = showLogs ?? true;
    this.authors = authors ?? [];

    this.client()
  }

  set saveState(state: any) {
    this.state = state
  }

  private async client() {
    InitDisplay(this as never)

    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) as any });
    const { state, saveCreds } = await useMultiFileAuthState("session/zaileys");
    store.readFromFile("session/data.json");
    loop(async () => {
      try {
        store.writeToFile("session/data.json")
      } catch (error) {
        await this.socket.emit('conn_msg', ['fail', chalk.yellow(`[DETECTED] session folder has been deleted by the user`)])
        await delay(2000)
        await this.socket.emit('conn_msg', ['fail', chalk.yellow(`Please rerun the program...`)])
        await process.exit()
      }
    }, 10_000)

    this.state = state
    this.store = store

    const sock = makeWASocket(ConnectionConfig(this as never));
    store.bind(sock.ev);

    if (this.pairing && this.phoneNumber && !state.creds.me && !sock.authState.creds.registered) {
      this.socket.emit('conn_msg', ['start', 'Initialization new session...'])
      await delay(2000)
      this.socket.emit('conn_msg', ['start', `Creating new pairing code...`])
      await delay(6000)
      const code = await sock.requestPairingCode(this.phoneNumber.toString());
      this.socket.emit('conn_msg', ['info', `Connect with pairing code : ${chalk.green(code)}`])
    }

    sock.ev.on('messages.upsert', async (m) => {
      this.socket.emit('act_message', m.messages);
    });

    // console.log(/)

    let lts: any = await fetchJson('https://registry.npmjs.org/-/package/zaileys/dist-tags')
    sock.ev.process(async (ev) => {
      if (ev["creds.update"]) {
        let data = ev["creds.update"];
        if (data && lts) {
          this.socket.emit('conn_config', [
            chalk`{greenBright → Login as       :} {redBright ${data.me?.verifiedName || data.me?.name}}`,
            chalk`{greenBright → Login Method   :} {cyanBright ${data.pairingCode ? 'Pairing Code' : 'QR Code'}}`,
            chalk`{greenBright → Login Platform :} {cyanBright ${data.platform}}`,
            chalk`{greenBright → Creds Phone    :} {magentaBright ${data.phoneId}}`,
            chalk`{greenBright → Creds Device   :} {magentaBright ${data.deviceId}}`,
            chalk`{greenBright → Libs Current   :} {yellowBright zaileys-${pkg.version}}`,
            chalk`{greenBright → Libs Latest    :} {${lts?.latest == pkg.version ? 'yellowBright' : 'cyanBright'} zaileys-${lts?.latest}}${lts?.latest == pkg.version ? '' : ' {cyan newest!}'}`,
            ''
          ]);
        }
        await saveCreds()
      };

      if (ev["connection.update"]) {
        const update = ev["connection.update"];
        const { connection, lastDisconnect, qr } = update;

        if (connection == 'connecting') {
          this.socket.emit('act_connection', 'connecting');
          this.socket.emit('conn_msg', ['start', 'Connecting to server...'])
        }

        if (qr) {
          this.socket.emit('conn_msg', ['warn', 'Please scan the QR code...'])
        }

        if (connection === "close") {
          this.socket.emit('act_connection', 'close');
          const last: any = lastDisconnect?.error;
          const isReconnect = last?.output.statusCode !== DisconnectReason.loggedOut;
          
          if (isReconnect) {
            this.socket.emit('conn_msg', ['warn', 'Failed to connect. Waiting for reconnect...']);
            this.client()
          }

          if (DisconnectReason.loggedOut || DisconnectReason.badSession) {
            this.socket.emit('conn_msg', ['fail', 'Failed to connect. Please delete session and try again.']);
            return;
          }
          
          if (DisconnectReason.connectionReplaced) {
            await this.socket.emit('conn_msg', ['fail', chalk`{redBright Connection was lost because the same session was in use!}`]);
            await process.exit(0)
          }

          await this.socket.emit('conn_msg', ['info', 'Trying to reconnect...']);
          await delay(2000)
          await this.socket.emit('conn_msg', ['clear']);
        }

        if (connection === "open") {
          this.socket.emit('act_connection', 'ready');
          this.socket.emit('conn_msg', ['succeed', 'Connected to server']);
          console.log()
        }
      }
    });

    return sock;
  }

  on<T extends keyof ActionsProps>(actions: T, callback: (ctx: Prettify<ActionsProps[T]>) => void) {
    const call = (name: string, cb: (x: any) => void) => this.socket.on(`act_${name}`, cb);

    switch (actions) {
      case 'connection':
        call(actions, (msg) => callback(msg));
        break;

      case 'message':
        call(actions, async (msg) => callback(MessageParser(msg, this as any) as any));
        break;

      default:
        break;
    }
  }
}