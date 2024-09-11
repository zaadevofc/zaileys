import { Client } from '..';

const wa = new Client({
  phoneNumber: 62858788977802,
  method: 'pairing',
});

wa.on('open', () => {
  console.log('Connection is now open');
});

wa.on('message', (data) => {
  console.log(JSON.stringify(data, null, 2));
});