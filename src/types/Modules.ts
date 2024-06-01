export type ClientProps = {
  phoneNumber: number;
  pairing: boolean;
  state?: any;
  store?: any;
}

export type ActionsProps = 'ready' | 'message'