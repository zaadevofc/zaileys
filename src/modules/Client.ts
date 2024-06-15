import { Boom } from "@hapi/boom";
import {
  AuthenticationState,
  DisconnectReason,
  makeInMemoryStore,
  makeWASocket,
  useMultiFileAuthState
} from "baileys";
import ora from "ora";
import { ActionsProps, ClientProps, Prettify } from "../types";
import { ConnectionConfig, delay, loop } from "../utils";
import { Actions } from "./Actions";
import { InitDisplay } from "./Display";
import { MessageParser } from "./Parser";
import { socket } from "./Socket";

export class Client extends Actions {
  public pairing: boolean;
  public markOnline: boolean;
  public phoneNumber: number;
  public showLogs: boolean;
  public authors: number[];
  public ignoreMe: boolean;

  private socket = socket;
  private registeredActions: Set<string> = new Set(); // Set untuk melacak actions yang sudah didaftarkan
  private socked: Partial<{ sock: ReturnType<typeof makeWASocket>, store: ReturnType<typeof makeInMemoryStore>, state: AuthenticationState }> = {};
  private spinners: ora.Ora = ora();
  private initialized: boolean = false;

  constructor({ pairing, markOnline, phoneNumber, showLogs, authors, ignoreMe }: ClientProps) {
    super({ pairing, markOnline, phoneNumber, showLogs, authors, ignoreMe });
    this.pairing = pairing ?? true;
    this.markOnline = pairing ?? true;
    this.phoneNumber = phoneNumber;
    this.showLogs = showLogs ?? true;
    this.ignoreMe = ignoreMe ?? false;
    this.authors = authors ?? [];
  }

  private async init() {
    InitDisplay(this);
    this.spinners.start('Connecting to server...');

    const store = makeInMemoryStore({});
    const { state, saveCreds } = await useMultiFileAuthState("session/zaileys");

    loop(async () => {
      try {
        store.readFromFile("session/data.json");
        store.writeToFile("session/data.json");
      } catch (error) {
        await this.spinners.fail(`Warning: Cannot detect session file`);
        await delay(2000);
        await this.spinners.info(`Please rerun the program...`);
        await process.exit();
      }
    }, 10_000);

    const sock = makeWASocket(ConnectionConfig(this as never, state, store));
    store.bind(sock.ev);

    sock.ev.on("creds.update", saveCreds);

    if (this.pairing && this.phoneNumber && !sock.authState.creds.registered) {
      this.spinners.text = 'Initialization new session...';
      await delay(2000);
      this.spinners.text = `Creating new pairing code...`;
      await delay(6000);
      try {
        const code = await sock.requestPairingCode(this.phoneNumber.toString());
        this.spinners.info(`Connect with pairing code : ${(code)}`);
      } catch (error) {
        this.spinners.fail('Connection close. Please delete session and run again...');
        process.exit(0);
      }
    }

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (connection == 'connecting') {
        this.spinners.start('Connecting to server...');
      }

      if (!this.pairing && qr) {
        this.spinners.info('Scan this QR Code with your WhatsApp');
      }

      if (connection === "close") {
        const lastCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = lastCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          await this.spinners.info('Reconnecting to server...');
          await (this.initialized = false)
          await this.init();
        } else {
          this.spinners.fail('Detected logout. Please delete session and run again');
          process.exit(0);
        }
      } else if (connection === "open") {
        this.spinners.succeed('Successfully connected to server');
        console.log();
      }
    });

    this.socked = { sock, store, state };
    this.initialized = true;
    return { sock, store, state };
  }

  async on<T extends keyof ActionsProps>(actions: T, callback: (ctx: Prettify<ActionsProps[T]>) => void) {

    if (!this.registeredActions.has(actions)) {
      this.registeredActions.add(actions);

      if (!this.initialized) {
        if ((this.registeredActions.has('connection') ?? this.registeredActions.has('message'))) {
          await this.init();
        }
      }

      switch (actions) {
        case 'connection':
          // Handler untuk 'connection' jika diperlukan
          break;

        case 'message':
          this.socked.sock?.ev.on('messages.upsert', async (msg: any) => {
            const parse: any = await MessageParser(msg.messages, this as never, this.socked.store!, this.socked.state!);
            parse.forEach((x: any) => {
              if (x) callback(x);
            });
          });
          break;
      }
    }
  }

  async sendMsg(text: string, { jid }: { jid: string }) {
    await this.socked.sock?.sendMessage!(jid, { text });
  }
}
