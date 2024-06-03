import { EventEmitter } from 'events';
import QuickLRU from 'quick-lru';

export const cache = new QuickLRU({ maxSize: 9999999999 });
export const socket = new EventEmitter();