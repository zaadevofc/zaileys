import cfonts from 'cfonts';
import chalk from 'chalk';
import ora from 'ora';
import log from 'log-update'
import { ClientProps } from '../types';
import { cache, socket } from './Socket';
import { funding } from '../../package.json'

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

  cfonts.say(`         Love this package? help me with donation:         |               ${funding}                 |`, {
    font: 'console',
    colors: ['black'],
    background: 'green',
    letterSpacing: 1,
    // lineHeight: 1,
    space: false,
    maxLength: '0'
  });



  socket.on('conn_msg', async (data: any) => {
    const init_spin: any = ora()
    await init_spin[data[0]](data[1])
    await init_spin.clear()
  })

  if (config.showLogs) {
    socket.on('act_msg', (data: any) => {

      // console.log({ data })
      // init_spin[data[0]](data[1])
    });
  }
}