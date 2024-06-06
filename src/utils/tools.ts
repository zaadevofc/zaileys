import { MESSAGE_TYPE } from "./config";

export function loop(cb: () => void, ms: number) {
  return setInterval(cb, ms);
}

export function jsonString(obj: any): any {
  return JSON.stringify(obj ?? {}, null, 2)
}

export function jsonParse(obj: any): any {
  return JSON.parse(jsonString(obj))
}
export function timeout(cb: () => void, ms: number) {
  return setTimeout(cb, ms);
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const fetchJson = async (uri: any, method?: any) => await fetch(uri).then((x) => x.json())

export const postJson = async (uri: any, data: any) => await fetch(uri, { body: JSON.stringify(data), method: 'POST' }).then((x) => x.json())

export function getValuesByKeys(object: any, keys: string[]): any[] {
  const values: any[] = [];

  const search = (obj: any) => {
    if (obj === null || obj === undefined) {
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach(search);
    } else if (typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        if (keys.includes(key)) {
          values.push(value);
        }
        search(value);
      });
    }
  };

  search(object);
  return values;
}

export function removeKeys(object: any, keys: string[]): any {
  const remove = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(remove);
    }

    const newObject: any = {};
    for (const key in obj) {
      if (!keys.includes(key)) {
        newObject[key] = remove(obj[key]);
      }
    }

    return newObject;
  };

  return remove(jsonParse(object));
}

export function getMessageType(obj: any): string[] {
  obj = jsonParse(obj)
  if (typeof obj !== 'object' || obj === null) return [];
  for (const key of Object.keys(obj)) {
    if (Object.keys(MESSAGE_TYPE).includes(key)) return [MESSAGE_TYPE[key as keyof typeof MESSAGE_TYPE], key];
  }
  for (const value of Object.values(obj)) {
    const nestedType = getMessageType(value);
    if (nestedType) return nestedType;
  }
  return [];
}

