/**
 * Represents the properties of the ReadyParserProps.
 * Used to represent the status of the client.
 */
export type ReadyParserProps = 'ready' | 'connecting' | 'close'

/**
 * Represents the properties of the MessageTypeProps.
 * Used to represent the type of the message.
 */
export type MessageTypeProps = 'text' | 'sticker' | 'image' | 'video' | 'document' | 'product' | 'reaction' | 'gif' | 'audio' | 'voice' | 'contact' | 'polling' | 'location' | 'unknown'

/**
 * Represents the internal properties of a message.
 * Used to hold the essential information about a message.
 */
export type MessageInternalProps = {
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
}

/**
 * Represents the parsed properties of a message.
 * Used to hold the parsed information about a message.
 */
export type MessageParserProps = MessageInternalProps[] & {
  /**
   * The body of the message.
   * @type {Object}
   * @property {MessageTypeProps} type - The type of the message.
   * @property {string} [text] - The text of the message (if applicable).
   */
  body: {
    type: MessageTypeProps;
    text?: string
  }
}[]
