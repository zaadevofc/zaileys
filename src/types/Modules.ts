import { makeInMemoryStore } from "@whiskeysockets/baileys";
import { MessageParserProps, ReadyParserProps } from "./Parser";

/**
 * Utility type for providing a prettier version of a type.
 * It is used to create a type where all keys are required.
 * @template T - The original type to create a prettier version of.
 */
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {};

/**
 * Represents the properties of the client.
 * It is used to configure the client.
 */
export type ClientProps = {
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
}

/**
 * Represents the actions that can be performed by the client.
 */
export type ActionsProps = {
  /**
   * The properties of a message.
   */
  message: MessageParserProps;

  /**
   * The properties of a connection.
   */
  connection: ReadyParserProps;
}
