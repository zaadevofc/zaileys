import { Boom } from "@hapi/boom";
import {
  DisconnectReason,
  makeInMemoryStore,
  makeWASocket,
  useMultiFileAuthState
} from "baileys";
import ora from "ora";
import { ActionsProps, ClientProps, Prettify } from "../types";
import { ConnectionConfig, delay, loop } from "../utils";
import { Transactions } from "./Actions";
import { InitDisplay } from "./Display";

const spinners: ora.Ora = ora();

export async function Client(config: ClientProps) {
  InitDisplay(config);
  const { pairing, markOnline, phoneNumber, showLogs, authors, ignoreMe } = config;
  spinners.start('Connecting to server...');

  const store = makeInMemoryStore({});
  const { state, saveCreds } = await useMultiFileAuthState("session/zaileys");

  loop(async () => {
    try {
      store.readFromFile("session/data.json");
      store.writeToFile("session/data.json");
    } catch (error) {
      await spinners.fail(`Warning: Cannot detect session file`);
      await delay(2000);
      await spinners.info(`Please rerun the program...`);
      await process.exit();
    }
  }, 10_000);

  const sock = makeWASocket(ConnectionConfig(config, state, store));
  store.bind(sock.ev);

  sock.ev.on("creds.update", saveCreds);

  if (pairing && phoneNumber && !sock.authState.creds.registered) {
    spinners.text = 'Initialization new session...';
    await delay(2000);
    spinners.text = `Creating new pairing code...`;
    await delay(6000);
    try {
      const code = await sock.requestPairingCode(phoneNumber.toString());
      spinners.info(`Connect with pairing code : ${(code)}`);
    } catch (error) {
      spinners.fail('Connection close. Please delete session and run again...');
      process.exit(0);
    }
  }

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection == 'connecting') {
      spinners.start('Connecting to server...');
    }

    if (!pairing && qr) {
      spinners.info('Scan this QR Code with your WhatsApp');
    }

    if (connection === "close") {
      const lastCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = lastCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        await spinners.info('Reconnecting to server...');
        await Client(config);
      } else {
        spinners.fail('Detected logout. Please delete session and run again');
        process.exit(0);
      }
    } else if (connection === "open") {
      spinners.succeed('Successfully connected to server');
      console.log();
    }
  });

  return {
    ...Transactions(),
    on<T extends keyof ActionsProps>(actions: T, callback: (ctx: Prettify<ActionsProps[T]>) => void) {
      if (actions == 'connection') {
        console.log('hahahahahhahah')
      }
    }
  }
}