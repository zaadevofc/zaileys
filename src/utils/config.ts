import { UserFacingSocketConfig, makeCacheableSignalKeyStore, proto } from "@whiskeysockets/baileys";
import pino from 'pino';
import { ClientProps } from "../types";
import defaults from './defaults.json'
import NodeCache from "node-cache";
import { jsonParse } from "./tools";

export function ConnectionConfig(props: ClientProps): UserFacingSocketConfig {
  async function getMessage(key: any) {
    if (props.store) {
      const msg = await props.store.loadMessage(key.remoteJid, key.id);
      return msg?.message || undefined;
    }
    return proto.Message.fromObject({});
  }

  return {
    printQRInTerminal: !props.pairing,
    defaultQueryTimeoutMs: 0,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    msgRetryCounterCache: new NodeCache(),
    syncFullHistory: true,
    mobile: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    browser: ["Mac OS", 'chrome', "121.0.6167.159"],
    version: defaults.version as never,
    logger: pino({ level: 'fatal' }) as never,
    auth: {
      creds: props.state.creds,
      keys: makeCacheableSignalKeyStore(props.state.keys, pino().child({ level: 'silent', stream: 'store' }) as any),
    },
    getMessage,
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
  }
}

export const MESSAGE_TYPE = {
  text: 'text',
  conversation: 'text',
  imageMessage: 'image',
  contactMessage: 'contact',
  locationMessage: 'location',
  extendedTextMessage: 'text',
  documentMessage: 'document',
  audioMessage: 'audio',
  videoMessage: 'video',
  protocolMessage: 'protocol',
  contactsArrayMessage: 'contactsArray',
  highlyStructuredMessage: 'highlyStructured',
  sendPaymentMessage: 'sendPayment',
  liveLocationMessage: 'liveLocation',
  requestPaymentMessage: 'requestPayment',
  declinePaymentRequestMessage: 'declinePaymentRequest',
  cancelPaymentRequestMessage: 'cancelPaymentRequest',
  templateMessage: 'template',
  stickerMessage: 'sticker',
  groupInviteMessage: 'groupInvite',
  templateButtonReplyMessage: 'templateButtonReply',
  productMessage: 'product',
  deviceSentMessage: 'deviceSent',
  listMessage: 'list',
  viewOnceMessage: 'viewOnce',
  orderMessage: 'order',
  listResponseMessage: 'listResponse',
  ephemeralMessage: 'ephemeral',
  invoiceMessage: 'invoice',
  buttonsMessage: 'buttons',
  buttonsResponseMessage: 'buttonsResponse',
  paymentInviteMessage: 'paymentInvite',
  interactiveMessage: 'interactive',
  reactionMessage: 'reaction',
  stickerSyncRmrMessage: 'stickerSyncRmr',
  interactiveResponseMessage: 'interactiveResponse',
  pollCreationMessage: 'pollCreation',
  pollUpdateMessage: 'pollUpdate',
  keepInChatMessage: 'keepInChat',
  documentWithCaptionMessage: 'documentWithCaption',
  requestPhoneNumberMessage: 'requestPhoneNumber',
  viewOnceMessageV2: 'viewOnce',
  encReactionMessage: 'encReaction',
  editedMessage: 'edited',
  viewOnceMessageV2Extension: 'viewOnce',
  pollCreationMessageV2: 'pollCreation',
  scheduledCallCreationMessage: 'scheduledCallCreation',
  groupMentionedMessage: 'groupMentioned',
  pinInChatMessage: 'pinInChat',
  pollCreationMessageV3: 'pollCreation',
  scheduledCallEditMessage: 'scheduledCallEdit',
  ptvMessage: 'ptv',
  botInvokeMessage: 'botInvoke',
  callLogMesssage: 'callLog',
  encCommentMessage: 'encComment',
  bcallMessage: 'bcall',
  lottieStickerMessage: 'lottieSticker',
  eventMessage: 'event',
  commentMessage: 'comment',
  newsletterAdminInviteMessage: 'newsletterAdminInvite',
  extendedTextMessageWithParentKey: 'text',
  placeholderMessage: 'placeholder',
  encEventUpdateMessage: 'encEventUpdate',
}

export function getMessageType(obj: any): string[] {
  obj = jsonParse(obj)
  console.log({obj})
  if (typeof obj !== 'object' || obj === null) return [];
  for (const key of Object.keys(obj)) {
    if (Object.keys(MESSAGE_TYPE).includes(key)) return [MESSAGE_TYPE[key as keyof typeof MESSAGE_TYPE], key];
  }
  for (const value of Object.values(obj)) {
    const nestedType = getMessageType(value);
    if (nestedType) return nestedType;
  }
  return [];
}
