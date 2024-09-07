import { Client } from '..';

const client = new Client({
  phoneNumber: 62858788977802,
  method: 'pairing',
  
});

client.on('open', () => {
  console.log('Connection is now open');
});

client.on('message', (data) => {
  console.log('Received message:', JSON.stringify(data, null, 2));
});