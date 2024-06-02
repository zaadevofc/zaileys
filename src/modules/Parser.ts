import { proto } from '@whiskeysockets/baileys';
import { MessageParserProps } from './../types/Parser';
import { ClientProps } from '../types';

export function MessageParser(ctx: proto.IWebMessageInfo[], config: ClientProps): MessageParserProps {
  let messages: any = ctx.map((msg, i) => {
    let output: MessageParserProps = [];
    let jid = Number(msg.key.remoteJid?.split('@')[0])

    output.push({
      chatId: msg.key.id,
      fromMe: msg.key.fromMe,
      pushName: msg.pushName,
      remoteJid: msg.key.remoteJid,
      timestamp: msg.messageTimestamp,
      isAuthor: config.authors!.includes(jid),
      isBroadcast: msg.key.fromMe,
      isGroup: msg.key.fromMe,
      isViewOnce: msg.key.fromMe,
      body: {
        text: msg.userReceipt
      }
    } as any)

    return output;
  })

  return messages
}