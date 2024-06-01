export function loop(cb: Function, ms: number) {
  return setInterval(() => (cb)(), ms)
}

export function timeOut(cb: Function, ms: number) {
  return setTimeout(() => (cb)(), ms)
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}