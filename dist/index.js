"use strict";var K=Object.create;var P=Object.defineProperty;var j=Object.getOwnPropertyDescriptor;var U=Object.getOwnPropertyNames;var $=Object.getPrototypeOf,J=Object.prototype.hasOwnProperty;var Q=(t,e)=>{for(var s in e)P(t,s,{get:e[s],enumerable:!0})},A=(t,e,s,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of U(e))!J.call(t,n)&&n!==s&&P(t,n,{get:()=>e[n],enumerable:!(o=j(e,n))||o.enumerable});return t};var m=(t,e,s)=>(s=t!=null?K($(t)):{},A(e||!t||!t.__esModule?P(s,"default",{value:t,enumerable:!0}):s,t)),W=t=>A(P({},"__esModule",{value:!0}),t);var Z={};Q(Z,{Client:()=>E,ConnectionConfig:()=>S,InitDisplay:()=>O,MESSAGE_TYPE:()=>b,MessageParser:()=>_,delay:()=>f,getMessageType:()=>y,getValuesByKeys:()=>l,jsonParse:()=>N,jsonString:()=>g,loop:()=>T,removeKeys:()=>I,timeout:()=>H});module.exports=W(Z);var u=require("@whiskeysockets/baileys"),V=m(require("pino"));var x=require("@whiskeysockets/baileys"),C=m(require("pino"));var L={author:"https://github.com/zaadevofc",repository:"https://github.com/zaadevofc/zaileys",package:"https://www.npmjs.com/package/zaileys",version:[2,2413,1]};var B=m(require("node-cache"));function S(t){async function e(s){return t.store?(await t.store.loadMessage(s.remoteJid,s.id))?.message||void 0:x.proto.Message.fromObject({})}return{printQRInTerminal:!t.pairing,defaultQueryTimeoutMs:0,connectTimeoutMs:6e4,keepAliveIntervalMs:1e4,msgRetryCounterCache:new B.default,syncFullHistory:!0,mobile:!1,markOnlineOnConnect:!1,generateHighQualityLinkPreview:!0,browser:["Mac OS","chrome","121.0.6167.159"],version:L.version,logger:(0,C.default)({level:"fatal"}),auth:{creds:t.state.creds,keys:(0,x.makeCacheableSignalKeyStore)(t.state.keys,(0,C.default)().child({level:"silent",stream:"store"}))},getMessage:e,patchMessageBeforeSending:s=>(!!(s.buttonsMessage||s.templateMessage||s.listMessage)&&(s={viewOnceMessage:{message:{messageContextInfo:{deviceListMetadataVersion:2,deviceListMetadata:{}},...s}}}),s)}}var b={text:"text",conversation:"text",imageMessage:"image",contactMessage:"contact",locationMessage:"location",extendedTextMessage:"text",documentMessage:"document",audioMessage:"audio",videoMessage:"video",protocolMessage:"protocol",contactsArrayMessage:"contactsArray",highlyStructuredMessage:"highlyStructured",sendPaymentMessage:"sendPayment",liveLocationMessage:"liveLocation",requestPaymentMessage:"requestPayment",declinePaymentRequestMessage:"declinePaymentRequest",cancelPaymentRequestMessage:"cancelPaymentRequest",templateMessage:"template",stickerMessage:"sticker",groupInviteMessage:"groupInvite",templateButtonReplyMessage:"templateButtonReply",productMessage:"product",deviceSentMessage:"deviceSent",listMessage:"list",viewOnceMessage:"viewOnce",orderMessage:"order",listResponseMessage:"listResponse",ephemeralMessage:"ephemeral",invoiceMessage:"invoice",buttonsMessage:"buttons",buttonsResponseMessage:"buttonsResponse",paymentInviteMessage:"paymentInvite",interactiveMessage:"interactive",reactionMessage:"reaction",stickerSyncRmrMessage:"stickerSyncRmr",interactiveResponseMessage:"interactiveResponse",pollCreationMessage:"pollCreation",pollUpdateMessage:"pollUpdate",keepInChatMessage:"keepInChat",documentWithCaptionMessage:"documentWithCaption",requestPhoneNumberMessage:"requestPhoneNumber",viewOnceMessageV2:"viewOnce",encReactionMessage:"encReaction",editedMessage:"edited",viewOnceMessageV2Extension:"viewOnce",pollCreationMessageV2:"pollCreation",scheduledCallCreationMessage:"scheduledCallCreation",groupMentionedMessage:"groupMentioned",pinInChatMessage:"pinInChat",pollCreationMessageV3:"pollCreation",scheduledCallEditMessage:"scheduledCallEdit",ptvMessage:"ptv",botInvokeMessage:"botInvoke",callLogMesssage:"callLog",encCommentMessage:"encComment",bcallMessage:"bcall",lottieStickerMessage:"lottieSticker",eventMessage:"event",commentMessage:"comment",newsletterAdminInviteMessage:"newsletterAdminInvite",extendedTextMessageWithParentKey:"text",placeholderMessage:"placeholder",encEventUpdateMessage:"encEventUpdate"};function y(t){if(typeof t!="object"||t===null)return[];for(let e of Object.keys(t))if(Object.keys(b).includes(e))return[b[e],e];for(let e of Object.values(t)){let s=y(e);if(s)return s}return[]}function T(t,e){return setInterval(t,e)}function g(t){return JSON.stringify(t??{},null,2)}function N(t){return JSON.parse(g(t))}function H(t,e){return setTimeout(t,e)}async function f(t){return new Promise(e=>setTimeout(e,t))}function l(t,e){let s=[],o=n=>{n!=null&&(Array.isArray(n)?n.forEach(o):typeof n=="object"&&Object.entries(n).forEach(([r,a])=>{e.includes(r)&&s.push(a),o(a)}))};return o(t),s}function I(t,e){let s=o=>{if(o===null||typeof o!="object")return o;if(Array.isArray(o))return o.map(s);let n={};for(let r in o)e.includes(r)||(n[r]=s(o[r]));return n};return s(N(t))}var R=m(require("cfonts")),F=m(require("ora"));var q=require("events"),D=m(require("quick-lru")),ge=new D.default({maxSize:9999999999}),v=new q.EventEmitter;var Y=m(require("chalk"));function O(t){console.clear(),R.default.say("Zaileys",{font:"block",colors:["white","green"],letterSpacing:1,lineHeight:1,space:!1,maxLength:"0"}),R.default.say("         Love this package? help me with donation:         |               https://ko-fi.com/zaadevofc                 |",{font:"console",colors:["black"],background:"green",letterSpacing:1,space:!1,maxLength:"0"});let e=(0,F.default)();v.on("conn_msg",s=>{e[s[0]](s[1]),s[0]=="succeed"&&v.on("conn_config",o=>{o?.forEach((n,r)=>{console.log(n)})})}),t.showLogs}var p=m(require("chalk"));function _(t,e){return t.map((o,n)=>{let r=Number(o.key.remoteJid?.split("@")[0]);console.log(g(o));let a=I(o,["contextInfo"]),c=l(o,["quotedMessage"])[0],d=y(a),w=l(a,["conversation","text","caption","contentText","description"])[0],h=y(c),k=l(c,["conversation","text","caption","contentText","description"])[0],X=d[0]!="text"&&l(a,[d[1]]),M=h[0]!="text"&&l(c,[h[1]])[0];return M=h[0]=="viewOnce"?l(M,y(M))[0]:M,e.store?.loadMessage("6289526382389@s.whatsapp.net","81AF2468F3C7DD936D771326004D5930").then(z=>{console.log("orang =>>>>  ",z)}),{chatId:o.key.id,fromMe:o.key.fromMe,pushName:o.pushName,remoteJid:o.key.remoteJid,timestamp:o.messageTimestamp,isAuthor:e.authors.includes(r),isBroadcast:o.broadcast,body:{type:d,text:w,isGroup:g(a).includes("@g.us")??!1,isViewOnce:g(a).includes("viewOnce"),media:l(a,[d[1]])},reply:{type:h[0],text:k,isGroup:g(c).includes("@g.us")??!1,isViewOnce:g(c).includes("viewOnce"),media:M}}})}var E=class{pairing;phoneNumber;showLogs;authors;socket=v;store;state;me;constructor({pairing:e,phoneNumber:s,showLogs:o,authors:n}){this.pairing=e??!0,this.phoneNumber=s,this.showLogs=o??!0,this.authors=n??[],this.client()}set saveState(e){this.state=e}async client(){O(this);let e=(0,u.makeInMemoryStore)({logger:(0,V.default)().child({level:"silent",stream:"store"})}),{state:s,saveCreds:o}=await(0,u.useMultiFileAuthState)("session/zaileys");e.readFromFile("session/data.json"),T(async()=>{try{e.writeToFile("session/data.json")}catch{await this.socket.emit("conn_msg",["fail",p.default.yellow("[DETECTED] session folder has been deleted by the user")]),await f(2e3),await this.socket.emit("conn_msg",["fail",p.default.yellow("Please rerun the program...")]),await process.exit()}},1e4),this.state=s,this.store=e;let n=(0,u.makeWASocket)(S(this));if(e.bind(n.ev),this.pairing&&this.phoneNumber&&!s.creds.me&&!n.authState.creds.registered){this.socket.emit("conn_msg",["start","Initialization new session..."]),await f(2e3),this.socket.emit("conn_msg",["start","Creating new pairing code..."]),await f(6e3);let r=await n.requestPairingCode(this.phoneNumber.toString());this.socket.emit("conn_msg",["info",`Connect with pairing code : ${p.default.green(r)}`])}return n.ev.on("messages.upsert",async r=>{this.socket.emit("act_message",r.messages)}),n.ev.process(async r=>{if(r["creds.update"]){let a=r["creds.update"];this.socket.emit("conn_config",[p.default`{greenBright → Login as       :} {redBright ${a.me?.verifiedName||a.me?.name}}`,p.default`{greenBright → Login Method   :} {cyanBright ${this.pairing?"Pairing Code":"QR Code"}}`,p.default`{greenBright → Login Platform :} {yellowBright ${a.platform}}`,p.default`{greenBright → Phone Creds    :} {magentaBright ${a.phoneId}}`,p.default`{greenBright → Device Creds   :} {magentaBright ${a.deviceId}}`,""]),await o()}if(r["connection.update"]){let a=r["connection.update"],{connection:c,lastDisconnect:d,qr:w}=a;if(c=="connecting"&&(this.socket.emit("act_connection","connecting"),this.socket.emit("conn_msg",["start","Connecting to server..."])),w&&this.socket.emit("conn_msg",["warn","Please scan the QR code..."]),c==="close"){this.socket.emit("act_connection","close");let k=d?.error?.output.statusCode!==u.DisconnectReason.loggedOut;if(k&&(this.socket.emit("conn_msg",["warn","Failed to connect. Waiting for reconnect..."]),this.client()),!k){this.socket.emit("conn_msg",["fail","Failed to connect. Please delete session and try again."]);return}await this.socket.emit("conn_msg",["info","Trying to reconnect..."]),await f(2e3),await this.socket.emit("conn_msg",["clear"])}c==="open"&&(this.socket.emit("act_connection","ready"),this.socket.emit("conn_msg",["succeed","Connected to server"]),console.log())}}),n}on(e,s){let o=(n,r)=>this.socket.on(`act_${n}`,r);switch(e){case"connection":o(e,n=>s(n));break;case"message":o(e,async n=>s(_(n,this)));break;default:break}}};0&&(module.exports={Client,ConnectionConfig,InitDisplay,MESSAGE_TYPE,MessageParser,delay,getMessageType,getValuesByKeys,jsonParse,jsonString,loop,removeKeys,timeout});
