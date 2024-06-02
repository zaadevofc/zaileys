export type ClientProps = {
  phoneNumber: number;
  pairing?: boolean;
  showLogs?: boolean;
  state?: any;
  store?: any;
}

export type ActionsProps = 'ready' | 'message'