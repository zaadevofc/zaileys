import hapi from '@hapi/boom';
import * as baileys from '@whiskeysockets/baileys';
import { EventEmitter } from 'events';

export class Actions extends EventEmitter {
  private client!: ReturnType<typeof baileys.default>;
  private store!: ReturnType<typeof baileys.makeInMemoryStore>;

  public phoneNumber!: number;
  public method!: 'pairing' | 'qr';
  public showLogs!: boolean;
  public markOnline!: boolean;
  public autoRead!: boolean;
  public authors!: number[];
  public ignoreMe!: boolean;
  public startLoading!: Function;
  public stopLoading!: Function;
  public restart!: Function;

  connection(update: baileys.BaileysEventMap['connection.update']) {
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

  messages(m: baileys.BaileysEventMap['messages.upsert']) {
    console.log('Halloo')
    this.emit('message', m);
  }

  contactsUpdate(update: baileys.BaileysEventMap['contacts.update']) {
    for (const contact of update) {
      const id = baileys.jidNormalizedUser(contact.id!);
      if (this.store && this.store.contacts) this.store.contacts[id] = { id, name: contact.notify };
    }
  }

  contactsUpsert(update: baileys.BaileysEventMap['contacts.upsert']) {
    for (const contact of update) {
      const id = baileys.jidNormalizedUser(contact.id);
      if (this.store && this.store.contacts)
        this.store.contacts[id] != undefined && { ...(this.store.contacts[id] || {}), ...contact, isContact: true };
    }
  }

  groupsUpdate(updates: baileys.BaileysEventMap['groups.update']) {
    for (const update of updates) {
      const id = update.id!;
      if (this.store.groupMetadata[id]) {
        this.store.groupMetadata[id] = { ...(this.store.groupMetadata[id] || {}), ...update };
      }
    }
  }
}