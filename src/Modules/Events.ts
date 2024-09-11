import { Boom } from '@hapi/boom';
import * as baileys from '@whiskeysockets/baileys';
import { Client } from './Client';

export class Events {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  setupEventListeners(saveCreds: () => Promise<void>) {
    this.client.getClient().ev.on("creds.update", saveCreds);
    this.client.getClient().ev.on("connection.update", this.handleConnection.bind(this));
    this.client.getClient().ev.on("messages.upsert", m => this.client.emit('message', m));
    ['contacts.update', 'contacts.upsert', 'groups.update'].forEach(
      (event: any) => this.client.getClient().ev.on(event, this.handleStoreUpdate.bind(this, event))
    );
  }

  private handleConnection(update: baileys.BaileysEventMap['connection.update']) {
    const { lastDisconnect, connection, qr } = update;

    if (this.client.method === 'qr' && qr) {
      this.client.stopLoading('Scan this QR Code with your WhatsApp', 'info');
    }

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      const actionMap: { [key: number]: () => void } = {
        [baileys.DisconnectReason.badSession]: this.client.restart.bind(this.client),
        [baileys.DisconnectReason.connectionClosed]: this.client.restart.bind(this.client),
        [baileys.DisconnectReason.connectionLost]: this.client.restart.bind(this.client),
        [baileys.DisconnectReason.connectionReplaced]: () => {
          console.log("Connection Replaced, New Session Opened, Please Close Current Session First");
          this.client.restart();
        },
        [baileys.DisconnectReason.loggedOut]: () => {
          console.log("Device Logged Out, Please Connect Again");
          this.client.restart();
        },
        [baileys.DisconnectReason.restartRequired]: this.client.restart.bind(this.client),
        [baileys.DisconnectReason.multideviceMismatch]: () => {
          console.log("Multi-device Mismatch, Please Connect Again");
          this.client.restart();
        }
      };

      (actionMap[reason] || (() => {
        this.client.restart();
      }))();
    }
    if (connection === "open") {
      this.client.stopLoading("Connected to WhatsApp", 'succeed');
    }
  }

  private handleStoreUpdate(event: string, update: any) {
    if (event.startsWith('contacts')) {
      for (const contact of update) {
        const id = baileys.jidNormalizedUser(contact.id!);
        if (this.client.store?.contacts) this.client.store.contacts[id] = { ...this.client.store.contacts[id], ...contact, isContact: true };
      }
    } else if (event === 'groups.update') {
      for (const group of update) {
        const id = group.id!;
        if (this.client.store.groupMetadata[id]) this.client.store.groupMetadata[id] = { ...this.client.store.groupMetadata[id], ...group };
      }
    }
  }
}