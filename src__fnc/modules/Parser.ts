import { AuthenticationState, WAMessage, makeInMemoryStore } from 'baileys';
import { ClientProps } from '../types';
import { getMessageType, getValuesByKeys, jsonString, removeKeys } from '../utils';
import { MessageParserProps } from '../types/Parser';

export async function MessageParser(ctx: WAMessage[], config: ClientProps, store: ReturnType<typeof makeInMemoryStore>, state: AuthenticationState): Promise<MessageParserProps[] | undefined> {
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

    let bodyJid: any = getValuesByKeys(bodyKey, ['participant'])[0] || getValuesByKeys(bodyKey, ['remoteJid'])[0]
    let replyJid: any = getValuesByKeys(replyKey, ['participant'])[0]

    let bodyType: any = getMessageType((isEdit ? bodyEdited : bodyObj));
    bodyType = bodyType[0] == 'ephemeral' ? getMessageType(getValuesByKeys(bodyObj, [bodyType[1]])) : bodyType
    bodyType = bodyType[0] == 'viewOnce' ? getMessageType(getValuesByKeys(bodyObj, [bodyType[1]])) : bodyType

    let replyType = getMessageType(replyObj);
    replyType = replyType[0] == 'ephemeral' ? getMessageType(getValuesByKeys(replyObj, [replyType[1]])) : replyType
    replyType = replyType[0] == 'viewOnce' ? getMessageType(getValuesByKeys(replyObj, [replyType[1]])) : replyType

    let bodyText = getValuesByKeys(bodyObj, ['conversation', 'text', 'caption', 'contentText', 'description'])[0]
    let replyText = getValuesByKeys(replyObj, ['conversation', 'text', 'caption', 'contentText', 'description'])[0]

    let bodyMedia = !['text', 'reaction'].includes(bodyType[0]) && getValuesByKeys((isEdit ? bodyEdited : bodyObj), [bodyType[1] == 'documentWithCaptionMessage' ? 'documentMessage' : bodyType[1]])[0]
    bodyMedia = bodyType[0] == 'ephemeral' ? getValuesByKeys(bodyMedia, getMessageType(bodyMedia))[0] : bodyMedia
    bodyMedia = bodyType[0] == 'viewOnce' ? getValuesByKeys(bodyMedia, getMessageType(bodyMedia))[0] : bodyMedia

    let replyMedia = !['text', 'reaction'].includes(replyType[0]) && getValuesByKeys(replyObj, [replyType[1] == 'documentWithCaptionMessage' ? 'documentMessage' : replyType[1]])[0]
    replyMedia = replyType[0] == 'ephemeral' ? getValuesByKeys(replyMedia, getMessageType(replyMedia))[0] : replyMedia
    replyMedia = replyType[0] == 'viewOnce' ? getValuesByKeys(replyMedia, getMessageType(replyMedia))[0] : replyMedia

    return {
      body: {
        fromMe: msg.key.fromMe,
        chatId: msg.key.id,
        remoteJid: getValuesByKeys(bodyKey, ['remoteJid'])[0],
        participant: msg.key.fromMe ? (state.creds.me?.id.split(':')[0] !+ '@' + state.creds.me?.id.split('@')[1]) : bodyJid,
        pushName: msg.key.fromMe ? (state.creds.me?.verifiedName || state.creds.me?.name) : msg.pushName,
        timestamp: msg.messageTimestamp * 1000,
        type: bodyType[0],
        text: bodyText,
        isStory: jsonString(bodyKey).includes('status@broadcast'),
        isGroup: jsonString(bodyKey).includes('@g.us'),
        isViewOnce: jsonString(bodyObj).includes('viewOnce'),
        isForwarded: jsonString(msg.message).includes('isForwarded'),
        isEdited: jsonString(bodyObj).includes('editedMessage'),
        isBroadcast: msg.broadcast,
        isAuthor: config.authors!.includes(Number(bodyJid?.split('@')[0])),
        isEphemeral: getValuesByKeys(msg.message, ['expiration'])[0] > 0,
        media: bodyMedia,
      },
      reply: replyObj ? {
        chatId: getValuesByKeys(replyKey, ['stanzaId'])[0],
        participant: replyJid,
        type: replyType[0],
        text: replyText,
        isGroup: jsonString(replyKey).includes('@g.us'),
        isViewOnce: jsonString(replyKey).includes('viewOnce'),
        isForwarded: jsonString(msg.message).includes('isForwarded'),
        isAuthor: config.authors!.includes(Number(replyJid?.split('@')[0])),
        media: replyMedia,
      } : false
    };
  }))

  return messages;
}