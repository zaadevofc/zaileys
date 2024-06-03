import { proto } from '@whiskeysockets/baileys';
import { MessageParserProps } from './../types/Parser';
import { ClientProps } from '../types';
import { MESSAGE_TYPE, getMessageType, getValuesByKeys, jsonParse, jsonString, removeKeys } from '../utils';

export function MessageParser(ctx: proto.IWebMessageInfo[], config: ClientProps): MessageParserProps {
  let messages: any = ctx.map((msg, i) => {
    let jid = Number(msg.key.remoteJid?.split('@')[0])
    console.log(jsonString(msg))

    let bodyObj = removeKeys(msg, ['contextInfo'])
    let replyObj = getValuesByKeys(msg, ['quotedMessage'])[0]

    let bodyType = getMessageType(bodyObj);
    let bodyText = getValuesByKeys(bodyObj, ['conversation', 'text', 'caption', 'contentText', 'description'])[0]

    let replyType = getMessageType(replyObj);
    let replyText = getValuesByKeys(replyObj, ['conversation', 'text', 'caption', 'contentText', 'description'])[0]

    let bodyMedia = bodyType[0] != 'text' && getValuesByKeys(bodyObj, [bodyType[1]])
    // bodyMedia = bodyType[0] == 'viewOnce' ? getValuesByKeys(bodyMedia, getMessageType(bodyMedia))[0] : bodyMedia

    let replyMedia = replyType[0] != 'text' && getValuesByKeys(replyObj, [replyType[1]])[0]
    replyMedia = replyType[0] == 'viewOnce' ? getValuesByKeys(replyMedia, getMessageType(replyMedia))[0] : replyMedia
    config.store?.loadMessage("6289526382389@s.whatsapp.net", "81AF2468F3C7DD936D771326004D5930").then(x => {
      console.log('orang =>>>>  ', x)
    })
    return {
      chatId: msg.key.id,
      fromMe: msg.key.fromMe,
      pushName: msg.pushName,
      remoteJid: msg.key.remoteJid,
      timestamp: msg.messageTimestamp,
      isAuthor: config.authors!.includes(jid),
      isBroadcast: msg.broadcast,
      body: {
        type: bodyType,
        text: bodyText,
        isGroup: jsonString(bodyObj).includes('@g.us') ?? false,
        isViewOnce: jsonString(bodyObj).includes('viewOnce'),
        media: getValuesByKeys(bodyObj, [bodyType[1]]),
      },
      reply: {
        type: replyType[0],
        text: replyText,
        isGroup: jsonString(replyObj).includes('@g.us') ?? false,
        isViewOnce: jsonString(replyObj).includes('viewOnce'),
        media: replyMedia,
      }
    };
  })

  return messages
}