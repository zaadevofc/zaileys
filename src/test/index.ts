// import { Client } from '../../dist'
import { Client } from '..'

const client = new Client({
  phoneNumber: 6285878897780,
  pairing: true,
  showLogs: true,
})

client.on('connection', (ctx) => {
  if (ctx == 'ready') {
    // client.send('Haloo', { id: 34 })
  }
})

client.on('message', (ctx) => {
  // if (ctx.body.text == 'p') {
  //   ctx.send('Haloo')
  // }
})