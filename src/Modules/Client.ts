import hapi from '@hapi/boom';
import * as baileys from '@whiskeysockets/baileys';
import cfonts from 'cfonts';
import chalk from "chalk";
import { EventEmitter } from 'events';
import NodeCache from 'node-cache';
import ora, { Ora } from 'ora';
import pino from 'pino';

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

export class Client extends EventEmitter {
  private client!: ReturnType<typeof baileys.default>;
  private store!: ReturnType<typeof baileys.makeInMemoryStore>;
  private logger!: pino.Logger;
  private spinner!: Ora;

  public phoneNumber!: number;
  public method: 'pairing' | 'qr';
  public showLogs: boolean;
  public markOnline: boolean;
  public autoRead: boolean;
  public authors: number[];
  public ignoreMe: boolean;

  isRunning = false;

  constructor({ phoneNumber, method, showLogs, markOnline, autoRead, authors, ignoreMe }: ClientProps) {
    super();

    this.phoneNumber = phoneNumber;
    this.method = method;
    this.showLogs = showLogs ?? true;
    this.markOnline = markOnline ?? true;;
    this.autoRead = autoRead ?? true;;
    this.authors = authors ?? [];
    this.ignoreMe = ignoreMe ?? true;;

    this.setMaxListeners(20);
    this.start();
  }

  private async start() {
    await this.showBanner();
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      await this.setupClient();
    } catch (error) {
      this.stopLoading('Error initializing client', 'fail');
      this.startLoading('Connecting to WhatsApp...');
      this.isRunning = false;
      setTimeout(() => this.start(), 3000);
      return;
    }

    this.setupProcessHandlers();
  }

  private async restart() {
    this.stopLoading('Restarting connection...', 'info');
    this.isRunning = false;
    await this.start();
  }

  private async handleConnection(update: baileys.BaileysEventMap['connection.update']) {
    const { receivedPendingNotifications, lastDisconnect, connection, qr } = update;

    if (this.method == 'qr' && qr) {
      console.log()
      this.stopLoading('Scan this QR Code with your WhatsApp', 'info');
    }

    if (receivedPendingNotifications) {
      this.client.ev.flush();
    }

    if (connection === "close") {
      const reason = new hapi.Boom(lastDisconnect?.error)?.output.statusCode;
      const actionMap: { [key: number]: () => void } = {
        [baileys.DisconnectReason.badSession]: this.restart.bind(this),
        [baileys.DisconnectReason.connectionClosed]: this.restart.bind(this),
        [baileys.DisconnectReason.connectionLost]: this.restart.bind(this),
        [baileys.DisconnectReason.connectionReplaced]: () => {
          console.log("Connection Replaced, New Session Opened, Please Close Current Session First");
          this.restart();
        },
        [baileys.DisconnectReason.loggedOut]: () => {
          console.log("Device Logged Out, Please Connect Again");
          this.restart();
        },
        [baileys.DisconnectReason.restartRequired]: this.restart.bind(this),
        [baileys.DisconnectReason.multideviceMismatch]: () => {
          console.log("Multi-device Mismatch, Please Connect Again");
          this.restart();
        }
      };

      (actionMap[reason] || (() => {
        this.restart();
      }))();
    }

    if (connection === "open") {
      this.stopLoading("Connected to WhatsApp", 'succeed');
    }

  }

  private async showBanner() {
    console.clear();
    cfonts.say('Zaileys', {
      font: 'block',
      colors: ['candy', '#ffce51'],
      letterSpacing: 1,
      gradient: true,
      lineHeight: 1,
      space: false,
      maxLength: '0'
    })
    this.startLoading('Checking server connection...');
  }

  private async setupClient() {
    const { state, saveCreds } = await baileys.useMultiFileAuthState("./.zaileys/zaileys-auth");

    this.logger = pino({ enabled: false }),

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
      mobile: false,
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

    await this.setupPairingCode();

    this.client.ev.on("creds.update", saveCreds);
    this.client.ev.on("connection.update", this.handleConnection.bind(this));
    this.client.ev.on("messages.upsert", this.handleMessages.bind(this));
    this.client.ev.on("contacts.update", this.handleContactsUpdate.bind(this));
    this.client.ev.on("contacts.upsert", this.handleContactsUpsert.bind(this));
    this.client.ev.on("groups.update", this.handleGroupsUpdate.bind(this));

    setInterval(() => this.store.writeToFile("./.zaileys/zaileys-store.json"), 10000);
  }

  private async setupPairingCode() {
    if (!this.client.authState.creds.registered && this.method === 'pairing') {
      let phoneNumber = this.phoneNumber.toString().replace(/[^0-9]/g, "");

      if (!Object.keys(baileys.PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
        this.stopLoading("Warning: Please enter valid phone number", 'fail');
        process.exit(0);
      }

      this.stopLoading("Connection ready to run");
      this.startLoading("Waiting for requests pairing code...");

      setTimeout(async () => {
        let code = await this.client.requestPairingCode(phoneNumber);
        code = code?.match(/.{1,4}/g)?.join("-") || code;
        this.stopLoading('Your Pairing Code : ' + chalk.black(chalk.bgYellowBright.bold(` ${code} `)), 'info');
      }, 3000);
    }
  }

  private setupProcessHandlers() {
    process.setMaxListeners(20);

    process.on('message', async (data) => {
      console.log("[ RECEIVED ] ", data);
      if (data === "reset") {
        await this.restart();
      } else if (data === "uptime") {
        process.send?.(process.uptime());
      }
    });

    const exitHandler = async (code: number) => {
      this.isRunning = false;
      this.stopLoading(`Exited with code: ${code}`, 'fail');
      if (code !== 0) await this.start();
    };

    process.once('exit', exitHandler);

    ['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach((signal) => {
      process.once(signal as NodeJS.Signals, () => {
        process.exit(1);
      });
    });
  }

  private startLoading(text: string): void {
    if (!this.spinner) {
      this.spinner = ora({ text, color: 'cyan' }).start();
    }
  }

  private stopLoading(text?: string, success: 'succeed' | 'fail' | 'warn' | 'info' = 'succeed'): void {
    if (this.spinner) {
      this.spinner[success](text || 'Operation failed');
      this.spinner = null!;
    }
  }

  private handleMessages(m: baileys.BaileysEventMap['messages.upsert']) {
    console.log('Got message');
    this.emit('message', m);
  }

  private handleContactsUpdate(update: baileys.BaileysEventMap['contacts.update']) {
    for (const contact of update) {
      const id = baileys.jidNormalizedUser(contact.id!);
      if (this.store && this.store.contacts) this.store.contacts[id] = { id, name: contact.notify };
    }
  }

  private handleContactsUpsert(update: baileys.BaileysEventMap['contacts.upsert']) {
    for (const contact of update) {
      const id = baileys.jidNormalizedUser(contact.id);
      if (this.store && this.store.contacts)
        this.store.contacts[id] != undefined && { ...(this.store.contacts[id] || {}), ...contact, isContact: true };
    }
  }

  private handleGroupsUpdate(updates: baileys.BaileysEventMap['groups.update']) {
    for (const update of updates) {
      const id = update.id!;
      if (this.store.groupMetadata[id]) {
        this.store.groupMetadata[id] = { ...(this.store.groupMetadata[id] || {}), ...update };
      }
    }
  }

  async sendMessage(jid: string, content: baileys.AnyMessageContent, options: baileys.MiscMessageGenerationOptions = {}) {
    return this.client.sendMessage(jid, content, options);
  }

  on(eventName: EventName, callback: (...args: any[]) => void): this {
    super.on(eventName, callback);
    return this;
  }
}