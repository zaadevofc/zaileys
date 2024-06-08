import { WAMessage, makeInMemoryStore, proto } from 'baileys';
import { ClientProps } from '../types';
import { getMessageType, getValuesByKeys, jsonString, removeKeys } from '../utils';
import { MessageParserProps } from './../types/Parser';

export async function MessageParser(ctx: WAMessage[], config: ClientProps, store: ReturnType<typeof makeInMemoryStore>): Promise<MessageParserProps | undefined> {
  if (!ctx) return [];

  let messages: any = await Promise.all(ctx.map(async (msg, i) => {
    if (getMessageType(msg.message).length == 0) return;
    if (getMessageType(msg.message)[0] == 'protocol') return;
    if (jsonString(msg.message).includes('pollUpdateMessage')) return;


    let bodyObj = removeKeys(msg.message, ['contextInfo'])
    let replyObj = getValuesByKeys(msg.message, ['quotedMessage'])[0]

    let bodyKey = msg.key;
    let replyKey = getValuesByKeys(msg.message, ['contextInfo'])[0]

    let isEdit = getMessageType(bodyObj)[1] == 'editedMessage';
    let editKey = isEdit && getValuesByKeys(msg.message, ['protocolMessage'])[0].key
    let bodyEdited = isEdit && removeKeys(await store.loadMessage(editKey.remoteJid, editKey.id), ['contextInfo'])
    bodyEdited = removeKeys(bodyEdited.message, ['contextInfo'])

    let bodyJid: any = /\b\d+@\S+\b/g.exec(getValuesByKeys(bodyKey, ['participant'])[0] || getValuesByKeys(bodyKey, ['remoteJid'])[0])?.[0]
    let replyJid: any = /\b\d+@\S+\b/g.exec(getValuesByKeys(replyKey, ['participant'])[0])?.[0]

    let bodyType: any = getMessageType((isEdit ? bodyEdited : bodyObj));
    bodyType = bodyType[0] == 'viewOnce' ? getMessageType(getValuesByKeys(bodyObj, [bodyType[1]])) : bodyType
    let replyType = getMessageType(replyObj);
    replyType = replyType[0] == 'viewOnce' ? getMessageType(getValuesByKeys(replyObj, [replyType[1]])) : replyType

    let bodyText = getValuesByKeys(bodyObj, ['conversation', 'text', 'caption', 'contentText', 'description'])[0]
    let replyText = getValuesByKeys(replyObj, ['conversation', 'text', 'caption', 'contentText', 'description'])[0]

    let bodyMedia = bodyType[0] != 'text' && getValuesByKeys((isEdit ? bodyEdited : bodyObj), [bodyType[1] == 'documentWithCaptionMessage' ? 'documentMessage' : bodyType[1]])[0]
    bodyMedia = bodyType[0] == 'viewOnce' ? getValuesByKeys(bodyMedia, getMessageType(bodyMedia))[0] : bodyMedia

    let replyMedia = replyType[0] != 'text' && getValuesByKeys(replyObj, [replyType[1] == 'documentWithCaptionMessage' ? 'documentMessage' : replyType[1]])[0]
    replyMedia = replyType[0] == 'viewOnce' ? getValuesByKeys(replyMedia, getMessageType(replyMedia))[0] : replyMedia

    let replyStore: any = await store.messages[replyJid].get(getValuesByKeys(replyKey, ['stanzaId'])[0])
    console.log("🚀 ~ letmessages:any=awaitPromise.all ~ replyJid:", replyJid)
    console.log("🚀 ~ letmessages:any=awaitPromise.all ~ replyStore:", replyStore)

    return {
      body: {
        fromMe: msg.key.fromMe,
        chatId: msg.key.id,
        participant: bodyJid,
        pushName: msg.pushName,
        timestamp: msg.messageTimestamp,
        type: bodyType[0], 
        text: bodyText,
        isStory: jsonString(bodyKey).includes('status@broadcast') ?? false,
        isGroup: jsonString(bodyKey).includes('@g.us') ?? false,
        isViewOnce: jsonString(bodyObj).includes('viewOnce'),
        isForwarded: jsonString(msg.message).includes('isForwarded'),
        isEdited: jsonString(bodyObj).includes('editedMessage'),
        isBroadcast: msg.broadcast,
        isAuthor: config.authors!.includes(Number(bodyJid?.split('@')[0])),
        media: bodyMedia,
      },
      reply: replyObj && {
        fromMe: replyStore?.key?.fromMe,
        chatId: getValuesByKeys(replyKey, ['stanzaId'])[0],
        participant: replyJid,
        pushName: replyStore?.pushName,
        timestamp: replyStore?.messageTimestamp,
        type: replyType[0],
        text: replyText,
        isGroup: jsonString(replyKey).includes('@g.us') ?? false,
        isViewOnce: jsonString(replyKey).includes('viewOnce'),
        isForwarded: jsonString(msg.message).includes('isForwarded'),
        isAuthor: config.authors!.includes(Number(replyJid?.split('@')[0])),
        media: replyMedia,
      }
    };
  }))

  return messages;
}