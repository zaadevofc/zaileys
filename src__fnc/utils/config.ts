import { AuthenticationState, UserFacingSocketConfig, makeCacheableSignalKeyStore, makeInMemoryStore, proto } from "baileys";
import NodeCache from "node-cache";
import pino from 'pino';
import { ClientProps } from "../types";
import defaults from './defaults.json';

export function ConnectionConfig(props: ClientProps, state: AuthenticationState, store: ReturnType<typeof makeInMemoryStore>): UserFacingSocketConfig {
  async function getMessage(key: any) {
    if (store) {
      const msg = await store.loadMessage(key.remoteJid, key.id);
      return msg?.message || undefined;
    }
    return proto.Message.fromObject({});
  }

  return {
    printQRInTerminal: !props.pairing,
    markOnlineOnConnect: !props.markOnline,
    defaultQueryTimeoutMs: 0, 
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    msgRetryCounterCache: new NodeCache(),
    syncFullHistory: true,
    mobile: false,
    generateHighQualityLinkPreview: true,
    browser: defaults.browser as never,
    version: defaults.version as never,
    logger: pino({ enabled: false }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ enabled: false })),
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
  stickerSyncRmrMessage: 'sticker',
  interactiveResponseMessage: 'interactiveResponse',
  pollCreationMessage: 'pollCreation',
  pollUpdateMessage: 'pollUpdate',
  keepInChatMessage: 'keepInChat',
  documentWithCaptionMessage: 'document',
  requestPhoneNumberMessage: 'requestPhoneNumber',
  viewOnceMessageV2: 'viewOnce',
  encReactionMessage: 'reaction',
  editedMessage: 'text',
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
  newsletterAdminInviteMessage: 'text',
  extendedTextMessageWithParentKey: 'text',
  placeholderMessage: 'placeholder',
  encEventUpdateMessage: 'encEventUpdate',
}