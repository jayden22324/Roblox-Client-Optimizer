import { RCO3 } from '@rco3/lib';
import { Ansi, TTY } from '@rco3/ttyutil'
import { ensureFileSync, existsSync, readFileSync, rmSync, watch, writeFileSync } from 'fs-extra';
import { join } from 'node:path';
import process from 'node:process';
import config from './config';
import { exec, execSync, ExecSyncOptions, spawnSync } from 'node:child_process';
import prompts from 'prompts';
import Systray from '@3xpo/systray';

const evalJS = eval

type RCOWinAPI = {
  showConsole(): void;
  hideConsole(): void;
}
let WinAPI: RCOWinAPI = {
  showConsole: () => { },
  hideConsole: () => { },
}

/** Terminals, for spawning RCO Configurator */
export const terms: [string, string[], boolean][] = [
  ['kitty', ['--title', 'RCO Config', '--detach', '/usr/bin/bash', '-c'], false],
  ['lxterminal', ['-e'], false],
  ['xfce4-terminal', ['--title', 'RCO Config', '-e'], false],
  ['konsole', ['-e'], false],
  ['cmd', ['/c'], false],
  ['powershell', ['-c'], false],
  ['lxterm', ['-bg', 'black', '-fg', 'white', '-e'], false],
  ['uxterm', ['-bg', 'black', '-fg', 'white', '-e'], false],
  ['xterm', ['-bg', 'black', '-fg', 'white', '-e'], false],
]
/** Spawning terminals on macos is painful */
export const macSpawnTerminal = (cmd: string, cwd = process.cwd()) => {
  const temp = join(cwd, '.rco3.' + Math.random().toString(36) + Math.random().toString(36) + '.sh')
  writeFileSync(temp, `#!/bin/bash\n${cmd}`);
  return (options?: ExecSyncOptions) => {
    execSync(`chmod +x ${temp}`);
    return execSync(temp, {
      cwd,
      stdio: 'inherit',
      ...(options ?? {})
    });
  }
}

/** Clear Console */
const clear = () => {
  try {
    console.log('\n'.repeat(process.stdout.rows - 2));
  } catch (e) {
    console.clear()
  }
}
export const _tty = new TTY();
/** Center message on x axis */
export const centerX = (text: string) => {
  const rows = process.stdout.rows
  const textRows = text.split('\n').length
  const paddingTop = Math.ceil((rows - textRows) / 2)
  const paddingBottom = Math.floor((rows - textRows) / 2)
  if (paddingTop < 0 || paddingBottom < 0)
    return _tty.center(`\n\n\n${ansi.red()}Error: Terminal too small!${ansi.reset()}`);
  return ('\n'.repeat(paddingTop)) + text + ('\n'.repeat(paddingBottom));
}

export class ansi extends Ansi {
  static reset = (t?: string) => `${Ansi.reset()}${t ?? ''}`
  static red = (t?: string) => `${Ansi.rgb(241, 76, 76)}${t ?? ''}`
  static blue = (t?: string) => `${Ansi.rgb(59, 142, 234)}${t ?? ''}`
  static orange = (t?: string) => `${Ansi.rgb(235, 152, 59)}${t ?? ''}`
  static gray = (t?: string) => `${Ansi.rgb(122, 122, 122)}${t ?? ''}`
  static green = (t?: string) => `${Ansi.rgb(13, 177, 84)}${t ?? ''}`
}

enum CurrentMenu {
  Main,
  Help,
}

const {
  Flags,
  Oof,
  Roblox,
} = RCO3;

let isInConfig = false;
const safeFetch = async (url: string, fetchOptions: RequestInit = {}, id: string | number = 0, attempts = 16, delay = 2000): Promise<Response> => {
  if (typeof id === 'number')
    id = '0x' + id.toString(16);
  let ok = false;
  let response: Response | undefined
  while (!ok) {
    {
      let error: any;
      try {
        response = undefined;
        response = await fetch(url, fetchOptions);
      } catch (err) {
        error = err;
      }
      if (!response?.ok || !response) {
        const msg = `Failed to fetch ${url} (${id} - ${response ? `${response.status} ${response.statusText}` : error})`
        if (attempts === 0) {
          throw new Error(msg);
        } else {
          console.warn(`${msg}, retrying in ${delay / 1000} seconds...`);
          await new Promise(r => setTimeout(r, delay));
          attempts--;
        }
      } else
        return response;
    }
  }
  if (!response)
    throw new Error('Unreachable | Failed to fetch');
  return response;
}

(async () => {
  console.log('Preparing...');

  let toggleConsole = false;
  if (process.platform === 'win32') {
    try {
      if (!existsSync(join(__dirname, 'winapi.node')))
        writeFileSync(join(__dirname, 'winapi.node'), Buffer.from(await (await safeFetch('https://roblox-client-optimizer.simulhost.com/RCOWinAPI.node', {}, 0x0f)).arrayBuffer()))
      WinAPI = require('./winapi.node');
      toggleConsole = true;
    } catch (error) {
      console.warn(`Error while loading WinAPI:`, error);
    }
  }
  let ok = false;
  while (!ok)
    try {
      ok = (await fetch('https://roblox-client-optimizer.simulhost.com/')).ok
      if (!ok) throw new Error();
    } catch (error) {
      console.warn('Failed to connect to RCO server, retrying in 5 seconds...');
      await new Promise(r => setTimeout(r, 5000));
    }
  await Systray.install();
  const shaFilePath = join(__dirname, 'hash.txt')
  if (existsSync(shaFilePath) && readFileSync(shaFilePath, 'utf-8').trim() !== 'skip') {
    const remoteHash = (await (await safeFetch('https://roblox-client-optimizer.simulhost.com/RCO-JS/sha512sum.txt', {}, 0x00)).text()).trim()
    if (!existsSync(shaFilePath)) {
      ensureFileSync(shaFilePath)
      writeFileSync(shaFilePath, 'unknown hash')
    }
    const localHash = readFileSync(shaFilePath, 'utf-8').trim()
    const updateQuestionAskPositive = (localHash !== remoteHash || process.argv.includes('--force-update'))
    const updateQuestionAskNegative = process.argv.includes('--no-update') || process.env.RCO3_NO_UPDATE || existsSync(join(__dirname, '.no-update')) || process.argv.includes('--cfg')
    if (updateQuestionAskPositive && !updateQuestionAskNegative) {
      const { update } = await prompts({
        type: 'select',
        name: 'update',
        message: 'New version of RCO3 available, update?',
        initial: 0,
        choices: [
          { title: 'Yes', value: true },
          { title: 'No', value: false },
          { title: 'Skip this update', value: 'skip' }
        ]
      })
      if (update === 'skip') {
        writeFileSync(shaFilePath, remoteHash)
      } else if (update) {
        const installer = await (await safeFetch('https://roblox-client-optimizer.simulhost.com/installer-js/index.js', {}, 0x01)).text()
        evalJS(installer)
        return;
      }
    }
  }
  const files = await (await safeFetch('https://roblox-client-optimizer.simulhost.com/files.json', {}, 0x02)).json()
  for (const file of Object.keys(files)) {
    if (!existsSync(join(__dirname, file)) && !file.endsWith('.js') && !file.endsWith('.map') && file !== 'hash.txt' && !file.endsWith('.exe')) {
      console.log(`Downloading missing file ${file}...`);
      ensureFileSync(join(__dirname, file))
      writeFileSync(join(__dirname, file), Buffer.from(await (await safeFetch(`https://roblox-client-optimizer.simulhost.com/${file}`, {}, 0x03)).arrayBuffer()))
    }
  }
  if (process.argv.includes('--cfg')) {
    console.clear()
    return await config();
  }
  else if (process.argv.includes('--uninstall')) {
    // uninstall
    console.log('Uninstalling...');
    const roblox = new Roblox();
    const flags = new Flags();
    const oof = new Oof();
    if (!process.argv.includes('--no-flag')) // only in uninstall & one-time mode
      await flags.Uninstall(roblox);
    if (!process.argv.includes('--no-oof')) // only in uninstall & one-time mode
      await oof.Uninstall(roblox);
    console.log('Uninstalled!');
    process.exit(0)
  } else if (process.argv.includes('--one-time')) {
    // one-time install, no persistence/re-fetching
    console.log('One-Time mode enabled, running once & exiting...')
    const roblox = new Roblox()
    const flags = new Flags()
    const oof = new Oof();

    if (!process.argv.includes('--no-flag')) {// only in uninstall & one-time mode
      console.log('Downloading Flag File...');
      await flags.Install(roblox)
    }
    if (!process.argv.includes('--no-oof')) { // only in uninstall & one-time mode
      console.log('Downloading Oof Sound...');
      await oof.Install(roblox);
    }
    console.log('Done!');
    process.exit(0)
  } else {
    // main app
    console.log('Starting up...');
    const roblox = new Roblox();
    const flags = new Flags();
    const customFlags = join(flags.root, 'customflags.json');
    const reconstruct = () => {
      try {
        if (existsSync(customFlags)) {
          const flagFile = readFileSync(customFlags, 'utf-8')
          if (flagFile.trim() !== '')
            flags.construct(JSON.parse(flagFile));
          delete flags.overrides.undefined
        } else {
          flags.construct({})
          ensureFileSync(customFlags);
          writeFileSync(customFlags, '{}')
        }
      } catch (error) {
        console.error('Error reconstructing flags:', error);
        process.exit(1)
      }
    }
    reconstruct();
    watch(flags.root, (etype, filename) => {
      if (etype === 'change' && filename === 'customflags.json') {
        reconstruct()
        updateState()
      }
    })
    const oof = new Oof();
    const tty = new TTY();
    const rcoe = join(flags.root, '.rcoenabled')
    let enabled = existsSync(rcoe);
    let updating = false;
    let setEnabled = (e: boolean) => {
      enabled = e;
      if (e)
        ensureFileSync(rcoe);
      else
        rmSync(rcoe);
    }
    const updateState = async () => {
      flags.uninit();
      if (enabled) {
        if (JSON.stringify({
          ...flags.flags,
          ...flags.overrides // making sure we overwrite just incase
        }) !== '{}')
          roblox.setFlags({
            ...flags.flags,
            ...flags.overrides // making sure we overwrite just incase
          });
        await flags.init(roblox);
        if (!process.argv.includes('--no-oof') && !process.env['RCO3_NO_OOF'] && !existsSync(join(flags.root, '.rconooof')))
          await oof.Install();
      } else {
        await flags.Uninstall();
        // await oof.Uninstall(); // Roblox locks/locked content files on the OS level, so we can't delete it
      }
    }
    let currentMenu: CurrentMenu = CurrentMenu.Main
    const menu = () => {
      if (isInConfig)
        return;
      switch (currentMenu) {
        case CurrentMenu.Main:
          console.log(centerX(tty.center(`

${ansi.reset()}${ansi.blue()}Roblox Client Optimizer 3${ansi.reset()}
${ansi.reset()}${ansi.orange()}Status:${ansi.reset()}${updating ? ' Updating' : enabled ? `  ${ansi.green()}Enabled` : ` ${ansi.red()}Disabled`}${ansi.reset()}
${ansi.gray()}Press h for help${ansi.reset()}
`)));
          break;
        case CurrentMenu.Help:
          console.log(centerX(tty.center(`
${ansi.reset()}${ansi.blue()}Roblox Client Optimizer 3${ansi.reset()}
${ansi.reset()}${ansi.orange()}Help${ansi.reset()}
${ansi.reset()}${ansi.gray()}Press t in the main menu to toggle RCO${ansi.reset()}
${ansi.reset()}${ansi.gray()}Press h to go back to this menu${ansi.reset()}
${ansi.reset()}${ansi.gray()}Press q to go back to the main menu from a submenu${ansi.reset()}
${ansi.reset()}${ansi.gray()}Press q from the main menu to exit${ansi.reset()}
${ansi.reset()}${ansi.gray()}Press c to enter the configuration utility${ansi.reset()}`)))
          break;
        default:
          throw new Error('Invalid/Unknown Menu found: ' + currentMenu)
      }
    }
    updateState()
    process.on('SIGWINCH', () => menu())
    if (!process.argv.includes('--no-systray')) {
      const redrawMenu = menu;
      (async () => {
        await Systray.install()
        const menu = {
          // use .png icon on posix & .ico on windows
          icon: readFileSync(`${__dirname}/animegirl.${process.platform === 'win32' ? 'ico' : 'png'}`).toString('base64'),
          title: "Test",
          tooltip: "Tips",
          items: [{
            title: "Command Prompt Visible",
            tooltip: "Is the command prompt visible?\nCan only toggle on certain platforms.",
            checked: true,
            enabled: toggleConsole
          }, {
            title: "Is Enabled",
            tooltip: "Is RCO enabled?",
            checked: enabled,
            enabled: true
          }, {
            title: "Exit",
            tooltip: "Quits the application",
            enabled: true
          }]
        }
        const systray = new Systray({
          menu,
        })

        const _setEnabled = setEnabled;
        setEnabled = (e: boolean) => {
          const rt = _setEnabled(e);
          systray.sendAction({
            type: 'update-item',
            item: {
              ...menu.items[1],
              checked: e
            },
            seq_id: 1
          })
          return rt;
        }

        systray.onClick(action => {
          switch (action.seq_id) {
            case 0:
              const checked = !action.item.checked
              systray.sendAction({
                type: 'update-item',
                item: {
                  ...action.item,
                  checked,
                },
                seq_id: action.seq_id,
              })
              if (checked)
                WinAPI.showConsole()
              else
                WinAPI.hideConsole()
              break;
            case 1:
              setEnabled(!action.item.checked)
              redrawMenu();
              break;
            case 2:
              systray.kill()
              process.exit()
            default:
              break;
          }
        })
      })()

    }
    // menu input loop
    while (true) {
      console.clear()
      menu()
      const key = await tty.readkey(true)

      switch (key) {
        case 't':
          if (currentMenu === CurrentMenu.Main) {
            updating = true;
            setEnabled(!enabled);
            menu();
            await updateState().catch(v => {
              console.error('Error updating state:', v);
              process.exit(1)
            });
            updating = false;
          }
          break;
        case 'q':
          if (currentMenu === CurrentMenu.Main)
            process.exit(0)
          else
            currentMenu = CurrentMenu.Main
          break;
        case 'h':
          currentMenu = CurrentMenu.Help
          break;
        case 'C':
          isInConfig = true;
          await config();
          isInConfig = false;
          break;
        case 'c': {
          const cmd = [`${__filename.endsWith('.ts') ? 'ts-' : ''}node`, __filename, `--cfg`]
          switch (process.platform) {
            case 'win32':
              const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
              const file = join(process.env['TEMP'] ?? process.cwd(), 'RCO_' + random + '.bat')
              writeFileSync(file, `@echo off
${cmd.map(v => `"${v}"`).join(' ')}
`)
              exec(`start cmd /c "${file}"`, (err, stdout, stderr) => {
                rmSync(file)
              })
              break;
            case 'linux':
              // find first term in path
              const term = terms.find(([term]) =>
                process.env['PATH']!.split(':').filter(v => existsSync(join(v, term))).length > 0
              )
              if (term) {
                spawnSync(term[0], [
                  ...term[1],
                  ...(term[2] ? cmd : [cmd.map(v => `"${v}"`).join(' ')])
                ], {
                  cwd: process.cwd(),
                })
              } else throw new Error('No terminal found! Press shift+c to use this process\'s terminal')
              break;
            case 'darwin':
              spawnSync('open', ['-a', 'Terminal', `node "${__filename}" --cfg`])
              break;
            default:
              throw new Error('Unknown platform: ' + process.platform)
          }
        }
      }
    }
  }
})()
