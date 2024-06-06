import { proto } from '@whiskeysockets/baileys';
import { ClientProps } from '../types';
import { getMessageType, getValuesByKeys, jsonString, removeKeys } from '../utils';
import { MessageParserProps } from './../types/Parser';

export function MessageParser(ctx: proto.IWebMessageInfo[], config: ClientProps): MessageParserProps {
  let messages: any = ctx.map((msg, i) => {
    if (getMessageType(msg.message).length == 0) return;
    
    console.log(jsonString(msg))

    let bodyObj = removeKeys(msg.message, ['contextInfo'])
    let replyObj = getValuesByKeys(msg.message, ['quotedMessage'])[0]

    let bodyKey = msg.key;
    let replyKey = getValuesByKeys(msg.message, ['contextInfo'])[0]

    let bodyJid = /\b\d+@\S+\b/g.exec(jsonString(bodyKey))?.[0]
    let replyJid = /\b\d+@\S+\b/g.exec(jsonString(replyKey))?.[0]

    let bodyType: any = getMessageType(bodyObj);
    bodyType = bodyType[0] == 'viewOnce' ? getMessageType(getValuesByKeys(bodyObj, [bodyType[1]])) : bodyType
    let replyType = getMessageType(replyObj);
    replyType = replyType[0] == 'viewOnce' ? getMessageType(getValuesByKeys(bodyObj, [replyType[1]])) : replyType

    let bodyText = getValuesByKeys(bodyObj, ['conversation', 'text', 'caption', 'contentText', 'description'])[0]
    let replyText = getValuesByKeys(replyObj, ['conversation', 'text', 'caption', 'contentText', 'description'])[0]

    let bodyMedia = bodyType[0] != 'text' && getValuesByKeys(bodyObj, [bodyType[1]])[0]
    bodyMedia = bodyType[0] == 'viewOnce' ? getValuesByKeys(bodyMedia, getMessageType(bodyMedia))[0] : bodyMedia

    let replyMedia = replyType[0] != 'text' && getValuesByKeys(replyObj, [replyType[1]])[0]
    replyMedia = replyType[0] == 'viewOnce' ? getValuesByKeys(replyMedia, getMessageType(replyMedia))[0] : replyMedia

    return {
      chatId: msg.key.id,
      fromMe: msg.key.fromMe,
      pushName: msg.pushName,
      remoteJid: msg.key.remoteJid,
      timestamp: msg.messageTimestamp,
      body: {
        type: bodyType[0],
        text: bodyText,
        isGroup: jsonString(bodyKey).includes('@g.us') ?? false,
        isViewOnce: jsonString(bodyObj).includes('viewOnce'),
        isBroadcast: msg.broadcast,
        isAuthor: config.authors!.includes(Number(bodyJid?.split('@')[0])),
        media: bodyMedia,
      },
      reply: replyObj && {
        type: replyType[0],
        text: replyText,
        isGroup: jsonString(replyKey).includes('@g.us') ?? false,
        isViewOnce: jsonString(replyKey).includes('viewOnce'),
        isAuthor: config.authors!.includes(Number(replyJid?.split('@')[0])),
        media: replyMedia,
      }
    };
  })

  return messages
}