// import * as baileys from '@whiskeysockets/baileys';
// import { EventEmitter } from 'events';
// import crypto from 'crypto';
// import fs from 'fs';
// import { parsePhoneNumber } from 'libphonenumber-js';
// import util from 'util';
// import chalk from 'chalk';

// export class Parser extends EventEmitter {
//   private client!: any;
//   private store!: ReturnType<typeof baileys.makeInMemoryStore>;
//   public phoneNumber!: number;
//   public method!: 'pairing' | 'qr';
//   public showLogs!: boolean;
//   public markOnline!: boolean;
//   public autoRead!: boolean;
//   public authors!: number[];
//   public ignoreMe!: boolean;
//   public startLoading!: Function;
//   public stopLoading!: Function;
//   public restart!: Function;

//   constructor(options: Partial<Parser>) {
//     super();
//     Object.assign(this, options);
//   }

//   private createLogger() {
//     return {
//       info: (...args: any[]) => this.log('INFO', ...args),
//       error: (...args: any[]) => this.log('ERROR', ...args),
//       warn: (...args: any[]) => this.log('WARNING', ...args),
//       debug: (...args: any[]) => this.log('DEBUG', ...args),
//     };
//   }

//   private log(level: string, ...args: any[]) {
//     if (!this.showLogs) return;
//     const color = {
//       INFO: chalk.cyan,
//       ERROR: chalk.red,
//       WARNING: chalk.yellow,
//       DEBUG: chalk.blue,
//     }[level];
//     console.log(chalk.bold.bgGreen(level), color!(util.format(...args)));
//   }

//   public decodeJid(jid: string): string {
//     if (!jid.includes('@')) return jid;
//     return baileys.jidNormalizedUser(jid);
//   }

//   public getName(jid: string): string | Promise<string> {
//     const decodedJid = this.decodeJid(jid);
//     if (decodedJid.endsWith('@g.us')) {
//       return this.getGroupName(decodedJid);
//     }
//     return this.getContactName(decodedJid);
//   }

//   private async getGroupName(jid: string): Promise<string> {
//     const groupMetadata = await this.client.groupMetadata(jid);
//     return groupMetadata.subject || '';
//   }

//   private getContactName(jid: string): string {
//     const contact = this.client.contacts[jid] || {};
//     return contact.name || contact.verifiedName || parsePhoneNumber(jid.replace('@s.whatsapp.net', '')).format('INTERNATIONAL');
//   }

//   public async sendMessage(jid: string, content: baileys.AnyMessageContent, options: baileys.MiscMessageGenerationOptions = {}) {
//     return this.client.sendMessage(jid, content, options);
//   }

//   public async downloadMediaMessage(message: baileys.WAMessage, type: string = 'buffer'): Promise<Buffer | { filename: string }> {
//     const buffer = await baileys.downloadMediaMessage(message, type, {}, { logger: this.createLogger() });
//     if (type === 'buffer') return buffer as Buffer;
//     const filename = `${crypto.randomBytes(4).toString('hex')}.${baileys.extensionForMediaMessage(message)}`;
//     await fs.promises.writeFile(filename, buffer as Buffer);
//     return { filename };
//   }

//   public getContentType(message: baileys.WAMessage): string | undefined {
//     const type = Object.keys(message).find(key =>
//       (key === 'conversation' || key.endsWith('Message') || key.endsWith('V2') || key.endsWith('V3')) &&
//       key !== 'senderKeyDistributionMessage'
//     );
//     return type;
//   }

//   public generateMessageID(prefix: string = '3EB0', length: number = 18): string {
//     return prefix + crypto.randomBytes(length).toString('hex').toUpperCase();
//   }

//   public async copyNForward(jid: string, message: baileys.WAMessage, forceForward: boolean = false, options: any = {}): Promise<baileys.WAMessage> {
//     let content = baileys.generateForwardMessageContent(message, !!forceForward);
//     let type = Object.keys(content)[0];

//     if (options.readViewOnce && message.message?.viewOnceMessage?.message) {
//       type = Object.keys(message.message.viewOnceMessage.message)[0];
//       delete content[type].viewOnce;
//       content = baileys.generateForwardMessageContent(baileys.WAMessageContent.fromObject(content), !!forceForward);
//       type = Object.keys(content)[0];
//     }

//     const forwardingScore = (options.forceForward ? (options.forceForward === true ? 1 : options.forceForward) : 0) || 1;
//     content[type].contextInfo = {
//       ...(message.message[type]?.contextInfo || {}),
//       ...content[type].contextInfo,
//       forwardingScore: forwardingScore,
//     };

//     const waMessage = baileys.generateWAMessageFromContent(jid, content, {
//       ...options,
//       userJid: this.client.user!.id,
//     });

//     await this.client.relayMessage(jid, waMessage.message!, { messageId: waMessage.key.id!, additionalAttributes: { ...options } });
//     return waMessage;
//   }

//   public async sendContact(jid: string, numbers: string[], name: string, quoted?: baileys.WAMessage, options: any = {}): Promise<baileys.WAMessage> {
//     const contacts = numbers.map(number => ({
//       displayName: name,
//       vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${number}:${number}\nEND:VCARD`
//     }));

//     return this.client.sendMessage(jid, {
//       contacts: {
//         displayName: `${contacts.length} Contact${contacts.length > 1 ? 's' : ''}`,
//         contacts: contacts
//       },
//       ...options
//     }, { quoted, ...options });
//   }

//   public parseMention(text: string): string[] {
//     return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net') || [];
//   }

//   public async sendMedia(jid: string, url: string, quoted: any, options: any = {}): Promise<baileys.WAMessage> {
//     let mime = options.mimetype || '';
//     let messageType = mime.split("/")[0].replace('application', 'document') as baileys.MessageType;

//     if (options.asDocument) messageType = 'document';

//     const buffer = await this.getBuffer(url);
//     return this.client.sendMessage(jid, { [messageType]: buffer, mimetype: mime, ...options }, { quoted, ...options });
//   }

//   private async getBuffer(url: string): Promise<Buffer> {
//     const response = await fetch(url);
//     return Buffer.from(await response.arrayBuffer());
//   }

//   public cMod(jid: string, message: baileys.WAMessage, text: string = '', sender: string = this.client.user!.id, options: any = {}): baileys.WAMessage {
//     const copy = baileys.WAMessageContent.fromObject(message);
//     const mtype = this.getContentType(copy)!;
//     const content = copy[mtype];

//     if (typeof content === 'string') copy[mtype] = text || content;
//     else if (content?.caption) content.caption = text || content.caption;
//     else if (content?.text) content.text = text || content.text;

//     if (typeof content !== 'string') {
//       copy[mtype] = { ...content, ...options };
//       copy[mtype].contextInfo = {
//         ...(content.contextInfo || {}),
//         mentionedJid: options.mentions || content.contextInfo?.mentionedJid || [],
//       };
//     }

//     if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
//     else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;

//     if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
//     else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;

//     copy.key.remoteJid = jid;
//     copy.key.fromMe = baileys.areJidsSameUser(sender, this.client.user!.id);

//     return baileys.proto.WebMessageInfo.fromObject(copy);
//   }

//   public async sendPoll(jid: string, name: string, values: string[], selectableCount: number = 1): Promise<baileys.WAMessage> {
//     return this.client.sendMessage(jid, { poll: { name, values, selectableCount } });
//   }

//   public async sendOrder(jid: string, itemCount: number, orderTitle: string, orderDescription: string, currency: string, amount: number): Promise<void> {
//     const order = baileys.generateWAMessageFromContent(jid, baileys.proto.Message.fromObject({
//       orderMessage: {
//         orderId: this.generateMessageID(),
//         thumbnail: Buffer.alloc(0),
//         itemCount: itemCount,
//         status: 'INQUIRY',
//         surface: 'CATALOG',
//         orderTitle: orderTitle,
//         message: orderDescription,
//         sellerJid: this.client.user!.id,
//         token: crypto.randomBytes(32).toString('hex'),
//         totalAmount1000: amount * 1000,
//         totalCurrencyCode: currency,
//       }
//     }), {});

//     await this.client.relayMessage(jid, order.message!, { messageId: order.key.id! });
//   }

//   public async setProfilePicture(jid: string, content: Buffer): Promise<void> {
//     const { img } = await baileys.generateProfilePicture(content);
//     await this.client.query({
//       tag: 'iq',
//       attrs: {
//         to: baileys.jidNormalizedUser(jid),
//         type: 'set',
//         xmlns: 'w:profile:picture'
//       },
//       content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }]
//     });
//   }

//   public async sendGroupV4Invite(jid: string, groupJid: string, inviteCode: string, inviteExpiration: number, groupName: string, caption: string, options: any = {}): Promise<baileys.WAMessage> {
//     const message = baileys.proto.Message.fromObject({
//       groupInviteMessage: {
//         groupJid: groupJid,
//         inviteCode: inviteCode,
//         inviteExpiration: inviteExpiration,
//         groupName: groupName,
//         jpegThumbnail: options.jpegThumbnail || null,
//         caption: caption
//       }
//     });

//     const m = baileys.generateWAMessageFromContent(jid, message, { userJid: this.client.user!.id });
//     await this.client.relayMessage(jid, m.message!, { messageId: m.key.id! });
//     return m;
//   }
// }