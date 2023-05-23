import RCO3Installer, { InstallAction } from "./Installer";
import { VersionCheck, NodeInstaller, PathHelper } from "@rco3/nodeinstallutil";
import fs from 'fs-extra';
import path from 'path';
import proc from 'process';
import { createHash } from 'crypto';
import { execSync } from "child_process";

export const installer = new RCO3Installer();

if (proc.argv.includes('-v') || proc.argv.includes('--version')) {
  if (!fs.existsSync(path.join(__dirname, '../package.json'))) throw new Error('Cannot find package.json!')
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'))
  console.log(`RCO3Installer v${pkg.version ?? 'unknown'}
Dependencies:
${Object.keys(pkg.dependencies).map(v => ` ${v}: ${pkg.dependencies[v]}`).join('\n')}
Node:
${Object.keys(proc.versions).map(v => ` ${v}: ${proc.versions[v]}`).join('\n')}`);
  proc.exit(0)
}

(async () => {
  // get sha512 hash of process.execPath
  console.log('Checking for updates...');
  const hash = createHash('sha512').update(fs.readFileSync(proc.execPath)).digest('hex')
  const remoteHash = (await (await fetch('https://roblox-client-optimizer.simulhost.com/RCO2Installer.hash')).text()).split(' ')[0]
  if (hash !== remoteHash) {
    installer.printTitleCredits()
    installer.printOutdatedMenu()
    installer.printFossNotice()
    const loop = async () => {
      const key = await installer.TTYText.readkey();
      switch (key) {
        case 'i':
          const tempDir = proc.env.TEMP ?? proc.env.TMP ?? proc.env.TMPDIR ?? '/tmp'
          const out = path.join(tempDir, 'RCO3-Installer.exe')
          const res = await fetch('https://roblox-client-optimizer.simulhost.com/RCO2Installer.exe')
          if (!res.ok) {
            installer.printInstallationStep(`Failed to download installer: ${res.statusText}`, 'Error')
            await new Promise(r => setTimeout(r, 1000))
            proc.exit(1)
          }
          fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()))
          installer.printInstallationStep(`Successfully downloaded installer to ${out} - Spawning`)
          try {
            fs.chmodSync(out, 0o755)
          } catch (error) {
            if (proc.platform !== 'win32')
              console.warn('Failed to chmod installer!', error);
          }
          // spawn(`${proc.platform==='win32'?'':proc.platform==='linux'?'':''}${out}`, { stdio: 'inherit' })
          // await new Promise(r => setTimeout(r, 1000))
          execSync(proc.platform === 'win32' ? `start cmd /c "${out}"` : out, {
            stdio: 'inherit'
          })
          proc.exit(0)
        case 'c':
          break;
        case 'q':
          proc.exit(0)
        default:
          await loop()
          break;
      }
    }
    await loop();
  }
  installer.printTitleCredits()
  installer.printMainMenu()
  installer.printFossNotice()
  const Action = await installer.getMainMenuInput() // will repeat until valid input or ctrl+c
  switch (Action) {
    case InstallAction.Quit:
      proc.exit(0)
    case InstallAction.Install: {
      const sysver = NodeInstaller.checkSystemVer()
      if (sysver === VersionCheck.Outdated) {
        installer.printInstallationStep(`NodeJS is Outdated!
Please either remove your system's NodeJS installation, or upgrade it to at least ${proc.versions.node}`, 'Error');
        return;
      } else if (sysver === VersionCheck.NotInstalled) {
        installer.printInstallationStep(`Node not installed! Attempting to install NodeJS`)
        await NodeInstaller.install()
        const phpr = new PathHelper()
        const node = phpr.search('node', proc.platform === 'win32')
        if (!node)
          throw new Error('Failed to install NodeJS! Please install it manually.')
        installer.printInstallationStep(`Successfully installed NodeJS @ ${node}`)
        await new Promise(r => setTimeout(r, 1000))
      }
      installer.printInstallationStep('Ensuring RCO3 Directory Exists');
      installer.ensureDir()
      installer.printInstallationStep('Downloading RCO3');
      await installer.downloadRCO3() // todo
      if (proc.platform === 'win32') {
        installer.printInstallationStep('Adding RCO3 to Registry');
        await installer.addToStartupRegistry()
      }
      installer.printInstallationStep('Copying Self to Directory');
      if (!__filename.includes('snapshot'))
        installer.copySelf()
      installer.printTitleCredits()
      installer.printLaunchMenu()
      installer.printFossNotice()
      let shouldQuit = false;
      while (!shouldQuit) {
        const LaunchAction = await installer.TTYText.readkey()
        switch (LaunchAction) {
          case 'l':
            installer.printInstallationStep('Launching RCO3', 'Launching');
            await installer.launchRCO3()
            shouldQuit = true;
            break;
          case 'q':
            shouldQuit = true;
            break;
          case '.':
            console.log(`Install Location: ${installer.RootDir}`);
            await new Promise(r => setTimeout(r, 1000))
            break;
        }
      }
      break;
    }
    case InstallAction.Uninstall: {
      if (process.execPath.startsWith(installer.RootDir)) {
        const out = path.join((proc.platform === 'win32' ? proc.env.USERPROFILE : proc.env.HOME) ?? proc.cwd(), 'RCO3-Installer.exe')
        fs.copyFileSync(process.execPath, out)
        installer.printInstallationStep(`RCO3 is currently running from the installation directory!
RCO Installer will exit in 10 seconds, and you can run the uninstaller again from ${out}.`)
        await new Promise(r => setTimeout(r, 10000))
        proc.exit(0)
      }
      installer.printInstallationStep('Removing RCO3 Directory', false);
      installer.ensureDirRemoved()
      if (proc.platform === 'win32') {
        installer.printInstallationStep('Removing RCO3 from Registry', false);
        try {
          await installer.removeFromStartupRegistry()
        } catch (error) {
          console.warn('Failed to remove RCO3 Startup Item from registry', error);
        }
      }
      installer.printInstallationStep('Done!', false);
      break;
    }
  }
})()
