import * as baileys from '@whiskeysockets/baileys';
import cfonts from 'cfonts';
import chalk from "chalk";
import { EventEmitter } from 'events';
import fs from 'fs';
import NodeCache from 'node-cache';
import ora from 'ora';
import path from 'path';
import pino from 'pino';
import { Events } from './Events';

type EventName = 'open' | 'message' | 'close' | 'error';

type ClientProps = {
  phoneNumber: number;
  method: 'pairing' | 'qr';
  showLogs?: boolean;
  markOnline?: boolean;
  autoRead?: boolean;
  authors?: number[];
  ignoreMe?: boolean;
}

const log = console.log;
const logBlock = (status: 'succeed' | 'fail' | 'warn' | 'info' = 'succeed') => {
  const init = {
    succeed: 'bgGreen',
    fail: 'bgRed',
    warn: 'bgYellow',
    info: 'bgCyan',
  }[status]

  return (chalk as any)[init](' ')
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class Client extends EventEmitter {
  private client!: ReturnType<typeof baileys.default>;
  public store!: ReturnType<typeof baileys.makeInMemoryStore>;
  private logger!: pino.Logger;
  private spinner!: ora.Ora;
  private events: Events;

  public phoneNumber!: number;
  public method!: 'pairing' | 'qr';
  public showLogs!: boolean;
  public markOnline!: boolean;
  public autoRead!: boolean;
  public authors!: number[];
  public ignoreMe!: boolean;

  isRunning = false;

  constructor(props: ClientProps) {
    super();
    Object.assign(this, props);
    this.setMaxListeners(20);
    this.events = new Events(this);
    this.start();
  }

  async start() {
    try {
      console.clear()
      this.startLoading('Initializing client...');
      await sleep(1000)
      if (this.isRunning) return;
      this.isRunning = true;
      await this.showBanner();
      await sleep(1000)
      this.spinner.text = 'Setupping client...';
      await this.setupClient();
      this.setupProcessHandlers();
    } catch (error) {
      this.logger.error(error);
      process.exit(1);
    }
  }

  restart() {
    this.stopLoading('Restarting connection...', 'info');
    this.isRunning = false;
    this.start();
  }

  private async showBanner() {
    const nT = " ".repeat(18) + chalk.bgRed.bold.underline(` NPM `);
    const vT = " ".repeat(14) + chalk.bgYellowBright.black.bold(` ~ Zaileys ~ `);
    const cT = " ".repeat(5) + chalk.bgYellowBright.black.bold` Copyright © ${new Date().getFullYear()} by {blue zaadevofc} `

    console.clear()

    log(nT);
    log(vT);
    log(cT);

    cfonts.say(' Zaileys ', {
      font: 'slick',
      colors: ['#ffce51', 'blue'],
      letterSpacing: 0.5,
    });

    log(chalk.dim(`^`.repeat(42)));
  }

  private async setupClient() {
    const { state, saveCreds } = await baileys.useMultiFileAuthState("./.zaileys/zaileys-auth");
    this.logger = pino({ enabled: false });
    this.store = baileys.makeInMemoryStore({ logger: this.logger });
    this.store.readFromFile("./.zaileys/zaileys-store.json");

    this.client = baileys.default({
      logger: this.logger,
      printQRInTerminal: this.method == 'qr',
      auth: {
        creds: state.creds,
        keys: baileys.makeCacheableSignalKeyStore(state.keys, this.logger),
      },
      browser: baileys.Browsers.ubuntu("Safari"),
      markOnlineOnConnect: this.markOnline,
      msgRetryCounterCache: new NodeCache(),
      defaultQueryTimeoutMs: 0,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 10000,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      getMessage: async (key) => {
        const jid = baileys.jidNormalizedUser(key.remoteJid!);
        return (await this.store.loadMessage(jid, key.id!))?.message! || "";
      },
      patchMessageBeforeSending: (message: any) => {
        const requiresPatch = !!(
          message.buttonsMessage
          || message.templateMessage
          || message.listMessage
        );
        if (requiresPatch) {
          message = {
            viewOnceMessage: {
              message: {
                messageContextInfo: {
                  deviceListMetadataVersion: 2,
                  deviceListMetadata: {},
                },
                ...message,
              },
            },
          };
        }
        return message;
      }
    });

    this.store.bind(this.client.ev);

    if (fs.existsSync(path.join("./.zaileys/zaileys-auth/creds.json")) && !this.client.authState.creds.registered) {
      await this.stopLoading(chalk`{underline {red {bold Broken session!}}}\n  System will delete {yellowBright .zaileys/zaileys-auth} automatically.\n`, 'fail');
      await sleep(500)
      await this.startLoading(`Cleaning credentials automatically...`);
      await sleep(500)
      await fs.rm(path.join("./.zaileys/zaileys-auth"), { recursive: true }, async (err) => {
        if (err) {
          await this.stopLoading(chalk`{underline {red {bold Repair Error!}}}\n  Failed to delete {yellowBright .zaileys/zaileys-auth} automatically. System will try again.\n`, 'fail');
          await sleep(500)
          await this.restart.bind(this)
        }
      });
      await sleep(500)
      await this.stopLoading(chalk`{underline {blueBright {bold Success Repair Session}}}\n  Wait system automatically running...\n`, 'info');
      await this.restart()
      return;
    }

    this.setupPairingCode();
    this.events.setupEventListeners(saveCreds);
  }

  private async setupPairingCode() {
    if (!this.client.authState.creds.registered && this.method === 'pairing') {
      const phoneNumber = this.phoneNumber.toString().replace(/[^0-9]/g, "");
      if (!Object.keys(baileys.PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
        this.stopLoading("Invalid phone number", 'fail');
        process.exit(0);
      }
      setTimeout(async () => {
        try {
          const code = await this.client.requestPairingCode(phoneNumber);
          this.stopLoading(chalk`{blueBright.bold.underline Login with Pairing}\n  Generating code: {bgYellowBright.bold.black  ${code} }`, 'info');
          this.startLoading(' ')

          let i = 0
          const interval = setInterval(async () => {
            i++
            this.spinner.text = chalk`{italic Code expired in {blueBright ${i}{bold /160}} sec}`

            if (i == 10) {
              clearInterval(interval)
              this.stopLoading('Code was expired! Restart waiting...', 'warn')
              this.restart()
            }

          }, 1000);


        } catch (error) {
          this.logger.error(error);
          this.stopLoading("Error requesting pairing code", 'fail');
          process.exit(1);
        }
      }, 1000);
    }
  }

  private setupProcessHandlers() {
    process.setMaxListeners(20);
    process.on('message', (data) => {
      if (data === "reset") this.restart();
      else if (data === "uptime") process.send?.(process.uptime());
    });
    process.once('exit', code => {
      this.isRunning = false;
      this.stopLoading(`Exited with code: ${code}`, 'fail');
      if (code !== 0) this.start();
    });
    ['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach(signal =>
      process.once(signal as NodeJS.Signals, () => process.exit(1))
    );
  }

  startLoading(text: string): void {
    this.spinner = ora({ text: chalk`${text}`, color: 'yellow', spinner: 'dots3' }).start()
  }

  stopLoading(text: string, status: 'succeed' | 'fail' | 'warn' | 'info' = 'succeed'): void {
    if (this.spinner) {
      this.spinner.stopAndPersist({ text, symbol: logBlock(status) })
      this.spinner = null!;
    }
  }

  async sendMessage(jid: string, content: baileys.AnyMessageContent, options: baileys.MiscMessageGenerationOptions = {}) {
    return this.client.sendMessage(jid, content, options);
  }

  on(eventName: EventName, callback: (...args: any[]) => void): this {
    super.on(eventName, callback);
    return this;
  }

  getClient() {
    return this.client;
  }
}