export type ReadyParserProps = 'ready' | 'connecting' | 'close'
export type MessageTypeProps = 'text' | 'sticker' | 'image' | 'video' | 'document' | 'product' | 'reaction' | 'gif' | 'audio' | 'voice' | 'contact' | 'polling' | 'location' | 'unknown'

export type MessageParserProps = {
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
  },
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
  }
}
