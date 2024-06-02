import { UserFacingSocketConfig } from '@whiskeysockets/baileys';

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
type MessageParserProps = MessageInternalProps & {
    body: {
        type: MessageTypeProps;
        text: string;
    };
};

type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
type ClientProps = {
    phoneNumber: number;
    pairing?: boolean;
    showLogs?: boolean;
    state?: any;
    store?: any;
};
type ActionsProps = {
    message: MessageParserProps;
    connection: ReadyParserProps;
};

declare class Client {
    readonly pairing: boolean;
    readonly phoneNumber: number;
    readonly showLogs: boolean;
    private socket;
    private store;
    private state;
    constructor({ pairing, phoneNumber, showLogs }: ClientProps);
    private client;
    on<T extends keyof ActionsProps>(actions: T, callback: (ctx: Prettify<ActionsProps[T]>) => void): void;
}

declare function InitDisplay(config: ClientProps): void;

declare function MessageParser(): void;

declare function ConnectionConfig(props: ClientProps): UserFacingSocketConfig;

declare function loop(cb: Function, ms: number): NodeJS.Timeout;
declare function timeOut(cb: Function, ms: number): NodeJS.Timeout;
declare function delay(ms: number): Promise<unknown>;

export { type ActionsProps, Client, type ClientProps, ConnectionConfig, InitDisplay, MessageParser, type Prettify, delay, loop, timeOut };
