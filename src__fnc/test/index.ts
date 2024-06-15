import { Client } from '..'

const wa: any = Client({
  phoneNumber: 6285878897780,
  pairing: true,
  showLogs: true,
  authors: [6285878897780]
})

// wa.on('message', async(ctx) => {
//   console.log(ctx)

//   if (ctx.body.text == 'hai') {
//     await wa.sendMsg('hallo aku bot whatsapp...', { jid: ctx.body.remoteJid })
//   }
// })

wa.on('connection', async (ctx: any) => {
  console.log(ctx)
}) 
