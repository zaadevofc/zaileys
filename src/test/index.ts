import { Client } from '../../dist'
// import { Client } from '..'

const client = new Client({
  phoneNumber: 6285878897780,
  pairing: true
})

client.on('ready', (ctx) => {
  console.log('WhatsApp Node Ready')
})

client.on('message', (ctx) => {
  console.log({ ctx })
})