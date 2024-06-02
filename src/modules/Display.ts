import cfonts from 'cfonts'
import ora from 'ora';
import { socket } from './Socket';
import { ClientProps } from '../types';

export function InitDisplay(config: ClientProps) {
  console.clear()
  cfonts.say('Zaileys', {
    font: 'block',
    colors: ['white', 'green'],
    letterSpacing: 1,
    lineHeight: 1,
    space: false,
    maxLength: '0'
  })

  cfonts.say('          Love this package? help me with donation:        |                https://ko-fi.com/zaadevofc                |', {
    font: 'console',
    colors: ['black'],
    background: 'green',
    letterSpacing: 1,
    // lineHeight: 1,
    space: false,
    maxLength: '0'
  });

  const init_spin: any = ora()
  socket.on('conn_msg', (data: any) => {
    init_spin[data[0]](data[1])
  });

  if (config.showLogs) {
    // socket.on('conn_msg', (data: any) => {
    //   init_spin[data[0]](data[1])
    // });
  }
}