export type ReadyParserProps = 'ready' | 'connecting' | 'close'

export type MessageTypeProps = 'text' | 'sticker' | 'image' | 'video' | 'document' | 'product' | 'reaction' | 'gif' | 'audio' | 'voice' | 'contact' | 'polling' | 'location' | 'unknown'
export type MessageInternalProps = {
  chatId: string;
  fromMe: boolean;
  pushName: string;
  remoteJid: string;
  timestamp: number;
  isAuthor: boolean;
  isBroadcast: boolean;
  isGroup: boolean;
  isViewOnce: boolean;
}
export type MessageParserProps = MessageInternalProps & {
  body: {
    type: MessageTypeProps;
    text: string
  }
}