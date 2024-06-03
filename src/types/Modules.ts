import { makeInMemoryStore } from "@whiskeysockets/baileys";
import { MessageParserProps, ReadyParserProps } from "./Parser";

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type ClientProps = {
  phoneNumber: number;
  pairing?: boolean;
  showLogs?: boolean;
  authors?: number[];
  state?: any;
  me?: any;
  store?: ReturnType<typeof makeInMemoryStore>;
}

export type ActionsProps = {
  message: MessageParserProps;
  connection: ReadyParserProps
}