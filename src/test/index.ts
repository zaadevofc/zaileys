import { Client } from '..'

const client = new Client({
  pairing: true
})

client.on('ready', (ctx) => {
  console.log('WhatsApp Node Ready')
})

client.on('message', (ctx) => {
  if (ctx.message == 'hai') {
    ctx.send('Heloooww')
  }
})
