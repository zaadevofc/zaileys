import { Boom } from "@hapi/boom";
import {
  BaileysEventMap,
  DisconnectReason,
  makeInMemoryStore,
  makeWASocket,
  useMultiFileAuthState
} from "baileys";
import chalk from "chalk";
import { ActionsProps, ClientProps, Prettify } from "../types";
import { ConnectionConfig, delay, getMessageType, jsonString, loop } from "../utils";
import { InitDisplay } from "./Display";
import { MessageParser } from "./Parser";
import { cache, socket } from "./Socket";
import pino from "pino";

export class Client {
  public pairing: boolean;
  public phoneNumber: number;
  public showLogs: boolean;
  public authors: number[];
  public ignoreMe: boolean;
  private canNext: boolean = false;

  private socket = socket;
  private sock: Partial<ReturnType<typeof makeWASocket>> = {};

  constructor({ pairing, phoneNumber, showLogs, authors, ignoreMe }: ClientProps) {
    this.pairing = pairing ?? true;
    this.phoneNumber = phoneNumber;
    this.showLogs = showLogs ?? true;
    this.ignoreMe = ignoreMe ?? false;
    this.authors = authors ?? [];

    this.init();
  }

  private async init() {
    const store = makeInMemoryStore({});
    const { state, saveCreds } = await useMultiFileAuthState("session/zaileys");
    store.readFromFile("session/data.json");

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

    const sock = makeWASocket(ConnectionConfig(this as never, state, store));
    store.bind(sock.ev);

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const ready = InitDisplay(this as never);
      const { connection, lastDisconnect } = update;

      if (connection == 'connecting') {
        console.log('menghubungkan....')
      }

      if (this.pairing && this.phoneNumber && !state.creds.me && !sock.authState.creds.registered) {
        this.socket.emit('conn_msg', ['start', 'Initialization new session...']);
        await delay(2000);
        this.socket.emit('conn_msg', ['start', `Creating new pairing code...`]);
        await delay(6000);
        const code = await sock.requestPairingCode(this.phoneNumber.toString());
        this.socket.emit('conn_msg', ['info', `Connect with pairing code : ${chalk.green(code)}`]);
      }

      if (connection === "close") {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          console.log('reconecting...');
          this.init();
        }
      } else if (connection === "open") {
        console.log('koneekk');
      }
    });

    sock.ev.process(async (data) => {
      if (data['messages.upsert']) {
        const msg = data['messages.upsert'];
        console.log(jsonString({ msg }))
        const parse: any = await MessageParser(msg.messages, this as never, store)
        if (parse.filter((x: any) => x).length == 0) return;
        await this.socket.emit('messages.upsert', parse)
      }
    })

  }

  async on<T extends keyof ActionsProps>(actions: T, callback: (ctx: Prettify<ActionsProps[T]>) => void) {
    const call = (name: Partial<keyof BaileysEventMap>, cb: (x: any) => void) => this.socket.on(name, cb);

    switch (actions) {
      case 'connection':
        // call(actions, (msg) => callback(msg));
        break;

      case 'message':
        call('messages.upsert', (msg) => {
          if (!msg) return;
          callback(msg)
        });
        break;
    }
  }
}

