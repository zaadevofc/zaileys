import { UserFacingSocketConfig, makeCacheableSignalKeyStore, proto } from "@whiskeysockets/baileys";
import pino from 'pino';
import { ClientProps } from "../types";
import defaults from './defaults.json'
import NodeCache from "node-cache";
export function ConnectionConfig(props: ClientProps): UserFacingSocketConfig {
  async function getMessage(key: any) {
    if (props.store) {
      const msg = await props.store.loadMessage(key.remoteJid, key.id);
      return msg?.message || undefined;
    }
    return proto.Message.fromObject({});
  }

  return {
    printQRInTerminal: !props.pairing,
    defaultQueryTimeoutMs: 0,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    msgRetryCounterCache: new NodeCache(),
    syncFullHistory: true,
    mobile: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    browser: ["Mac OS", 'chrome', "121.0.6167.159"],
    version: defaults.version as never,
    logger: pino({ level: 'fatal' }) as never,
    auth: {
      creds: props.state.creds,
      keys: makeCacheableSignalKeyStore(props.state.keys, pino().child({ level: 'silent', stream: 'store' }) as any),
    },
    getMessage,
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