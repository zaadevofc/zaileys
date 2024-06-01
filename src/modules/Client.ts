import { ALL_WA_PATCH_NAMES } from '@whiskeysockets/baileys'
import { ActionsProps, ClientProps } from "../types";

export class Client {
  private readonly pairing: boolean;

  constructor({ pairing }: ClientProps) {
    this.pairing = pairing;
  }

  on(actions: ActionsProps, callback: (ctx: 'a') => void) {

  }
}