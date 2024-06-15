import { WAMessage, makeInMemoryStore, AuthenticationState, UserFacingSocketConfig } from 'baileys';

type ReadyParserProps = 'ready' | 'connecting' | 'close';
type MessageParserProps = {
    body: {
        fromMe: boolean;
        chatId: string;
        remoteJid: string;
        participant: string;
        pushName: string;
        timestamp: number;
        type: string;
        text: string;
        isStory: boolean;
        isGroup: boolean;
        isViewOnce: boolean;
        isForwarded: boolean;
        isEdited: boolean;
        isBroadcast: boolean;
        isAuthor: boolean;
        isEphemeral: boolean;
        media: any;
    };
    reply: {
        chatId: string;
        participant: string;
        type: string;
        text: string;
        isGroup: boolean;
        isViewOnce: boolean;
        isForwarded: boolean;
        isAuthor: boolean;
        media: any;
    };
};

type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
type ClientProps = {
    phoneNumber: number;
    pairing?: boolean;
    markOnline?: boolean;
    showLogs?: boolean;
    ignoreMe?: boolean;
    authors?: number[];
};
type ActionsProps = {
    message: MessageParserProps;
    connection: ReadyParserProps;
};

declare class Actions {
    constructor({ pairing, markOnline, phoneNumber, showLogs, authors, ignoreMe }: ClientProps);
    sendText(): string;
    sendReply(): void;
}

declare class Client extends Actions {
    pairing: boolean;
    markOnline: boolean;
    phoneNumber: number;
    showLogs: boolean;
    authors: number[];
    ignoreMe: boolean;
    private socket;
    private socked;
    private spinners;
    private initialized;
    private initPromise;
    constructor({ pairing, markOnline, phoneNumber, showLogs, authors, ignoreMe }: ClientProps);
    private init;
    on<T extends keyof ActionsProps>(actions: T, callback: (ctx: Prettify<ActionsProps[T]>) => void): Promise<void>;
    sendMsg(text: string, { jid }: {
        jid: string;
    }): Promise<void>;
}

declare function InitDisplay(config: ClientProps): void;

declare function MessageParser(ctx: WAMessage[], config: ClientProps, store: ReturnType<typeof makeInMemoryStore>, state: AuthenticationState): Promise<MessageParserProps[] | undefined>;

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

export { Actions, type ActionsProps, Client, type ClientProps, ConnectionConfig, InitDisplay, MESSAGE_TYPE, MessageParser, type Prettify, delay, fetchJson, getMessageType, getValuesByKeys, jsonParse, jsonString, loop, postJson, removeKeys, timeout };
