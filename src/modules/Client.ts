import {
  BaileysEventMap,
  DisconnectReason,
  makeInMemoryStore,
  makeWASocket,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import { EventEmitter } from 'events';
import pino from "pino";
import { ActionsProps, ClientProps } from "../types";
import { ConnectionConfig, delay, loop } from "../utils";

export class Client {
  public readonly pairing: boolean;
  public readonly phoneNumber: number;

  private eventEmitter = new EventEmitter();
  private store: any;
  private state: any;

  constructor({ pairing, phoneNumber }: ClientProps) {
    this.pairing = pairing;
    this.phoneNumber = phoneNumber;

    this.client()
  }

  private async client() {
    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) as any });
    const { state, saveCreds } = await useMultiFileAuthState("session/zaileys");
    store.readFromFile("session/data.json");
    loop(() => store.writeToFile("session/data.json"), 10_000)

    this.store = store
    this.state = state

    const sock = makeWASocket(ConnectionConfig(this as never));
    store.bind(sock.ev);

    if (!sock.authState.creds.registered) {
      console.log("Using Pairing Code To Connect: ", this.phoneNumber);
      await delay(6000)
      const code = await sock.requestPairingCode(this.phoneNumber.toString());
      console.log("Pairing Code:", code);
    }

    sock.ev.on('messages.upsert', async (m) => {
      this.eventEmitter.emit('message', m.messages);
    });

    sock.ev.process(async (ev) => {
      if (ev["creds.update"]) await saveCreds();
      if (ev["connection.update"]) {
        const update = ev["connection.update"];
        const { connection, lastDisconnect, qr } = update;

        if (connection === "close") {
          const last: any = lastDisconnect?.error;
          const isReconnect = last?.output.statusCode !== DisconnectReason.loggedOut;
          if (isReconnect) this.client();
          console.log("connection closed: ", lastDisconnect?.error, ", reconnecting: ", isReconnect);
        } else if (connection === "open") {
          this.eventEmitter.emit('ready', true);
          console.log("opened connection");
        }
      }
    });

    return sock;
  }

  on(actions: ActionsProps, callback: (ctx: any) => void) {
    const call = (name: string, cb: (x: any) => void) => this.eventEmitter.on(name, cb);

    switch (actions) {
      case 'ready':
        call(actions, callback);
        break;

      case 'message':
        call(actions, callback);
        break;

      default:
        break;
    }
  }
}