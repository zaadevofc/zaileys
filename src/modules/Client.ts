import {
  DisconnectReason,
  makeInMemoryStore,
  makeWASocket,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import pino from "pino";
import { ActionsProps, ClientProps, Prettify } from "../types";
import { ConnectionConfig, delay, loop } from "../utils";
import { InitDisplay } from "./Display";
import { socket } from "./Socket";
import chalk from "chalk";
import { spawn } from "child_process";
import { MessageParser } from "./Parser";

export class Client {
  public readonly pairing: boolean;
  public readonly phoneNumber: number;
  public readonly showLogs: boolean;
  public readonly authors: number[];

  private socket = socket;
  private store: any;
  private state: any;

  constructor({ pairing, phoneNumber, showLogs, authors }: ClientProps) {
    this.pairing = pairing ?? true;
    this.phoneNumber = phoneNumber;
    this.showLogs = showLogs ?? true;
    this.authors = authors ?? [];

    this.client()
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

    sock.ev.process(async (ev) => {
      if (ev["creds.update"]) await saveCreds();
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

          if (!isReconnect) {
            this.socket.emit('conn_msg', ['fail', 'Failed to connect. Please delete session and try again.']);
            return;
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
        call(actions, (msg) => callback(MessageParser(msg, this as any) as any));
        break;

      default:
        break;
    }
  }
}