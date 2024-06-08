// import { Client, jsonString } from '../../dist'
import { Client, jsonString } from '..'

const client = new Client({
  phoneNumber: 6285878897780,
  pairing: true,
  showLogs: true,
  authors: [6285878897780],
})

client.on('connection', (ctx) => {
  if (ctx == 'ready') {
    // client.send('Haloo', { id: 34 })
  }
})

client.on('message', (ctx) => {
  console.log('ssss ', jsonString(ctx))
  if (ctx[0].body.text == 'p') {
    console.log('hallo')
  }
})