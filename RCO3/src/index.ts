import { RCO3 } from '@rco3/lib';
import { Ansi, TTY } from '@rco3/ttyutil'
import { ensureFileSync, existsSync, readFileSync, rmSync, watch, writeFileSync } from 'fs-extra';
import { join } from 'path';
import process from 'process';
import config from './config';
import { execSync } from 'child_process';
import { ExecSyncOptions } from 'child_process';
import { spawnSync } from 'child_process';
import { exec } from 'child_process';
import { createHash } from 'crypto';
import prompts from 'prompts';

/** Terminals, for spawning RCO Configurator */
export const terms: [string, string[]][] = [
  ['kitty', ['--title', 'RCO Config', '--detach']],
  ['lxterminal', ['-e']],
  ['xfce4-terminal', ['--title', 'RCO Config', '-e']],
  ['konsole', ['-e']],
  ['cmd', ['/c']],
  ['powershell', ['-c']],
  ['lxterm', ['-bg', 'black', '-fg', 'white', '-e']],
  ['uxterm', ['-bg', 'black', '-fg', 'white', '-e']],
  ['xterm', ['-bg', 'black', '-fg', 'white', '-e']],
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

(async () => {
  const remoteHash = (await (await fetch('https://roblox-client-optimizer.simulhost.com/RCO-JS/sha512sum.txt')).text()).trim()
  const shaFilePath = join(__dirname, 'hash.txt')
  if (!existsSync(shaFilePath))
    ensureFileSync(shaFilePath)
  const localHash = readFileSync(shaFilePath, 'utf-8').trim()
  if (localHash !== remoteHash) {
    const { update } = await prompts({
      type: 'confirm',
      name: 'update',
      message: 'New version of RCO3 available, update?',
      initial: true
    })
    if (update) {
      const installer = await (await fetch('https://roblox-client-optimizer.simulhost.com/installer-js/index.js')).text()
      const installerHash = await (await fetch('https://roblox-client-optimizer.simulhost.com/installer-js/sha512sum.txt')).text()
      if (installerHash.trim() !== createHash('sha512').update(installer).digest('hex').trim())
        throw new Error('Installer hash mismatch!')
      writeFileSync(join(__dirname, 'installer.js'), installer)
      execSync('node installer.js', {
        cwd: __dirname,
        stdio: 'inherit'
      })
      rmSync(join(__dirname, 'installer.js'))
      process.exit(0)
    }
  }
  if (process.argv.includes('--cfg'))
    return await config();
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
    const setEnabled = (e: boolean) => {
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
          const cmd = `${__filename.endsWith('.ts') ? 'ts-' : ''}node "${__filename}" --cfg`
          switch (process.platform) {
            case 'win32':
              const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
              const file = join(process.env['TEMP'] ?? process.cwd(), 'RCO_' + random + '.bat')
              writeFileSync(file, `@echo off
${cmd}
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
                spawnSync(term[0], [...term[1], cmd], {
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
