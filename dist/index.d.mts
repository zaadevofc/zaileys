import { makeInMemoryStore, proto, UserFacingSocketConfig } from '@whiskeysockets/baileys';

type ReadyParserProps = 'ready' | 'connecting' | 'close';
type MessageTypeProps = 'text' | 'sticker' | 'image' | 'video' | 'document' | 'product' | 'reaction' | 'gif' | 'audio' | 'voice' | 'contact' | 'polling' | 'location' | 'unknown';
type MessageInternalProps = {
    chatId: string;
    fromMe: boolean;
    pushName: string;
    remoteJid: string;
    timestamp: number;
    isAuthor: boolean;
    isBroadcast: boolean;
    isGroup: boolean;
    isViewOnce: boolean;
};
type MessageParserProps = MessageInternalProps[] & {
    body: {
        type: MessageTypeProps;
        text?: string;
    };
}[];

type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
type ClientProps = {
    phoneNumber: number;
    pairing?: boolean;
    showLogs?: boolean;
    authors?: number[];
    state?: any;
    me?: any;
    store?: ReturnType<typeof makeInMemoryStore>;
};
type ActionsProps = {
    message: MessageParserProps;
    connection: ReadyParserProps;
};

declare class Client {
    readonly pairing: boolean;
    readonly phoneNumber: number;
    readonly showLogs: boolean;
    readonly authors: number[];
    private socket;
    private store;
    private state;
    private me;
    constructor({ pairing, phoneNumber, showLogs, authors }: ClientProps);
    set saveState(state: any);
    private client;
    on<T extends keyof ActionsProps>(actions: T, callback: (ctx: Prettify<ActionsProps[T]>) => void): void;
}

declare function InitDisplay(config: ClientProps): void;

declare function MessageParser(ctx: proto.IWebMessageInfo[], config: ClientProps): MessageParserProps;

declare function ConnectionConfig(props: ClientProps): UserFacingSocketConfig;
declare const MESSAGE_TYPE: {
    text: string;
    conversation: string;
    imageMessage: string;
    contactMessage: string;
    locationMessage: string;
    extendedTextMessage: string;
    documentMessage: string;
    audioMessage: string;
    videoMessage: string;
    protocolMessage: string;
    contactsArrayMessage: string;
    highlyStructuredMessage: string;
    sendPaymentMessage: string;
    liveLocationMessage: string;
    requestPaymentMessage: string;
    declinePaymentRequestMessage: string;
    cancelPaymentRequestMessage: string;
    templateMessage: string;
    stickerMessage: string;
    groupInviteMessage: string;
    templateButtonReplyMessage: string;
    productMessage: string;
    deviceSentMessage: string;
    listMessage: string;
    viewOnceMessage: string;
    orderMessage: string;
    listResponseMessage: string;
    ephemeralMessage: string;
    invoiceMessage: string;
    buttonsMessage: string;
    buttonsResponseMessage: string;
    paymentInviteMessage: string;
    interactiveMessage: string;
    reactionMessage: string;
    stickerSyncRmrMessage: string;
    interactiveResponseMessage: string;
    pollCreationMessage: string;
    pollUpdateMessage: string;
    keepInChatMessage: string;
    documentWithCaptionMessage: string;
    requestPhoneNumberMessage: string;
    viewOnceMessageV2: string;
    encReactionMessage: string;
    editedMessage: string;
    viewOnceMessageV2Extension: string;
    pollCreationMessageV2: string;
    scheduledCallCreationMessage: string;
    groupMentionedMessage: string;
    pinInChatMessage: string;
    pollCreationMessageV3: string;
    scheduledCallEditMessage: string;
    ptvMessage: string;
    botInvokeMessage: string;
    callLogMesssage: string;
    encCommentMessage: string;
    bcallMessage: string;
    lottieStickerMessage: string;
    eventMessage: string;
    commentMessage: string;
    newsletterAdminInviteMessage: string;
    extendedTextMessageWithParentKey: string;
    placeholderMessage: string;
    encEventUpdateMessage: string;
};
declare function getMessageType(obj: any): string[];

declare function loop(cb: () => void, ms: number): NodeJS.Timeout;
declare function jsonString(obj: any): any;
declare function jsonParse(obj: any): any;
declare function timeout(cb: () => void, ms: number): NodeJS.Timeout;
declare function delay(ms: number): Promise<unknown>;
declare const fetchJson: (uri: any, method?: any) => Promise<any>;
declare const postJson: (uri: any, data: any) => Promise<any>;
declare function getValuesByKeys(object: any, keys: string[]): any[];
declare function removeKeys(object: any, keys: string[]): any;

export { type ActionsProps, Client, type ClientProps, ConnectionConfig, InitDisplay, MESSAGE_TYPE, MessageParser, type Prettify, delay, fetchJson, getMessageType, getValuesByKeys, jsonParse, jsonString, loop, postJson, removeKeys, timeout };
