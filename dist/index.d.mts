import { makeInMemoryStore, proto, UserFacingSocketConfig } from '@whiskeysockets/baileys';

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
        text?: string;
    };
}[];

/**
 * Utility type for providing a prettier version of a type.
 * It is used to create a type where all keys are required.
 * @template T - The original type to create a prettier version of.
 */
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
/**
 * Represents the properties of the client.
 * It is used to configure the client.
 */
type ClientProps = {
    /**
     * The phone number associated with the client.
     */
    phoneNumber: number;
    /**
     * Whether the client is in pairing mode.
     * If not provided, it defaults to true.
     */
    pairing?: boolean;
    /**
     * Whether to show logs.
     * If not provided, it defaults to true.
     */
    showLogs?: boolean;
    /**
     * The list of authorized users.
     */
    authors?: number[];
    /**
     * The state of the client.
     */
    state?: any;
    /**
     * The user associated with the client.
     */
    me?: any;
    /**
     * The store associated with the client.
     */
    store?: ReturnType<typeof makeInMemoryStore>;
};
/**
 * Represents the actions that can be performed by the client.
 */
type ActionsProps = {
    /**
     * The properties of a message.
     */
    message: MessageParserProps;
    /**
     * The properties of a connection.
     */
    connection: ReadyParserProps;
};

/**
 * Client class for WhatsApp Web connection
 */
declare class Client {
    /**
     * If the client is in pairing mode
     */
    readonly pairing: boolean;
    /**
     * Phone number of the client
     */
    readonly phoneNumber: number;
    /**
     * If the client should show logs
     */
    readonly showLogs: boolean;
    /**
     * Authorized phone numbers of the client
     */
    readonly authors: number[];
    private socket;
    private store;
    private state;
    private me;
    /**
     * Constructor for the client
     * @param {ClientProps} props - The client properties
     */
    constructor({ pairing, phoneNumber, showLogs, authors }: ClientProps);
    /**
     * Setter for the client state
     * @param {any} state - The state to set
     */
    set saveState(state: any);
    /**
     * Client connection initialization
     * @returns {Promise<WASocket>} - The socket connection
     */
    private client;
    /**
     * Event handler for specific actions
     * @param {T} actions - The actions to listen to
     * @param {(ctx: Prettify<ActionsProps[T]>) => void} callback - The callback function
     */
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
