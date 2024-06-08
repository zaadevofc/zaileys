import { WAMessage, makeInMemoryStore, AuthenticationState, UserFacingSocketConfig } from 'baileys';

/**
 * Represents the properties of the ReadyParserProps.
 * Used to represent the status of the client.
 */
type ReadyParserProps = 'ready' | 'connecting' | 'close';
/**
 * Represents the properties of the MessageTypeProps.
 * Used to represent the type of the message.
 */
type MessageTypeProps = 'text' | 'sticker' | 'image' | 'video' | 'document' | 'product' | 'reaction' | 'gif' | 'audio' | 'voice' | 'contact' | 'polling' | 'location' | 'unknown';
/**
 * Represents the internal properties of a message.
 * Used to hold the essential information about a message.
 */
type MessageInternalProps = {
    /**
     * The ID of the chat the message is in.
     * @type {string}
     */
    chatId: string;
    /**
     * Whether the message was sent by the current user.
     * @type {boolean}
     */
    fromMe: boolean;
    /**
     * The user's username.
     * @type {string}
     */
    pushName: string;
    /**
     * The user's ID.
     * @type {string}
     */
    remoteJid: string;
    /**
     * The timestamp of the message.
     * @type {number}
     */
    timestamp: number;
    /**
     * Whether the message is from an authorized user.
     * @type {boolean}
     */
    isAuthor: boolean;
    /**
     * Whether the message is a broadcast message.
     * @type {boolean}
     */
    isBroadcast: boolean;
    /**
     * Whether the message is sent in a group.
     * @type {boolean}
     */
    isGroup: boolean;
    /**
     * Whether the message is a view-once message.
     * @type {boolean}
     */
    isViewOnce: boolean;
};
/**
 * Represents the parsed properties of a message.
 * Used to hold the parsed information about a message.
 */
type MessageParserProps = MessageInternalProps[] & {
    /**
     * The body of the message.
     * @type {Object}
     * @property {MessageTypeProps} type - The type of the message.
     * @property {string} [text] - The text of the message (if applicable).
     */
    body: {
        type: MessageTypeProps;
        text?: string | undefined;
    };
}[];

type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
type ClientProps = {
    phoneNumber: number;
    pairing?: boolean;
    showLogs?: boolean;
    ignoreMe?: boolean;
    authors?: number[];
};
type ActionsProps = {
    message: MessageParserProps;
    connection: ReadyParserProps;
};

declare class Client {
    pairing: boolean;
    phoneNumber: number;
    showLogs: boolean;
    authors: number[];
    ignoreMe: boolean;
    private canNext;
    private socket;
    private sock;
    constructor({ pairing, phoneNumber, showLogs, authors, ignoreMe }: ClientProps);
    private init;
    on<T extends keyof ActionsProps>(actions: T, callback: (ctx: Prettify<ActionsProps[T]>) => void): Promise<void>;
}

declare function InitDisplay(config: ClientProps): void;

declare function MessageParser(ctx: WAMessage[], config: ClientProps, store: ReturnType<typeof makeInMemoryStore>): Promise<MessageParserProps | undefined>;

declare function ConnectionConfig(props: ClientProps, state: AuthenticationState, store: ReturnType<typeof makeInMemoryStore>): UserFacingSocketConfig;
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

declare function loop(cb: () => void, ms: number): NodeJS.Timeout;
declare function jsonString(obj: any): any;
declare function jsonParse(obj: any): any;
declare function timeout(cb: () => void, ms: number): NodeJS.Timeout;
declare function delay(ms: number): Promise<unknown>;
declare const fetchJson: (uri: any, method?: any) => Promise<any>;
declare const postJson: (uri: any, data: any) => Promise<any>;
declare function getValuesByKeys(object: any, keys: string[]): any[];
declare function removeKeys(object: any, keys: string[]): any;
declare function getMessageType(obj: any): string[];

export { type ActionsProps, Client, type ClientProps, ConnectionConfig, InitDisplay, MESSAGE_TYPE, MessageParser, type Prettify, delay, fetchJson, getMessageType, getValuesByKeys, jsonParse, jsonString, loop, postJson, removeKeys, timeout };
