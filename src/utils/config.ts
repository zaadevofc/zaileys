import { makeCacheableSignalKeyStore } from "@whiskeysockets/baileys";
import pino from 'pino';
import { ClientProps } from "../types";
import defaults from './defaults.json'
export function ConnectionConfig(props: ClientProps) {
  return {
    printQRInTerminal: !props.pairing,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    generateHighQualityLinkPreview: true,
    version: defaults.version,
    browser: ['Zaileys Node', 'Chrome', defaults.version.join('.')],
    logger: pino({ level: 'fatal' }),
    auth: {
      creds: props.state.creds,
      keys: makeCacheableSignalKeyStore(props.state.keys, pino().child({ level: 'silent', stream: 'store' }) as any),
    },
    patchMessageBeforeSending: (message: any) => {
      const requiresPatch = !!(
        message.buttonsMessage
        || message.templateMessage
        || message.listMessage
      );
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadataVersion: 2,
                deviceListMetadata: {},
              },
              ...message,
            },
          },
        };
      }

      return message;
    }
  }
}