import { MessageParserProps, ReadyParserProps } from "./Parser";

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type ClientProps = {
  phoneNumber: number;
  pairing?: boolean;
  showLogs?: boolean;
  ignoreMe?: boolean;
  authors?: number[];
}

export type ActionsProps = {
  message: MessageParserProps;
  connection: ReadyParserProps
}