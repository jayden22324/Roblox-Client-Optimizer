import fs, { existsSync } from 'fs-extra';
import { TTY as TTYTextConstructor, Ansi as ansi, HTTP } from '@rco3/ttyutil';
import { exec, execSync } from 'child_process';
import proc from 'process';
import path from 'path';

/** Install/Uninstall Actions */
export enum InstallAction {
  Install,
  Uninstall,
  Quit,
}
/** Install/Uninstall Keys */
export enum InstallKey {
  i = InstallAction.Install,
  u = InstallAction.Uninstall,
  q = InstallAction.Quit,
}

/** Main functionality; abstracts nearly everything */
export default class RCO3Installer {
  /** Download Base URL */
  public readonly DownloadBaseURL = 'https://roblox-client-optimizer.simulhost.com'
  /** Installation Folder, by default this is platform dependent */
  public readonly RootDir = proc.platform === 'win32' ? fs.existsSync(`C:\\Program Files (x86)\\RCO2`) ? `C:\\Program Files (x86)\\RCO2` : proc.env.USERPROFILE ? `${proc.env.USERPROFILE}\\.rco3` : `C:\\Program Files (x86)\\RCO3` : proc.env.HOME ? `${proc.env.HOME}/.rco3` : '/usr/local/rco3'
  public TTYText = new TTYTextConstructor()
  /** Download RCO3 */
  public async downloadRCO3() {
    try {
      const fileRoutePair = await HTTP.GetJSON(`${this.DownloadBaseURL}/files.json`) as Record<string, string>
      for (const file of Object.keys(fileRoutePair)) {
        console.log(`Downloading ${file}...`);
        await HTTP.Download(`${this.DownloadBaseURL}/${fileRoutePair[file]}`, path.join(this.RootDir, file))
      }
    } catch (error) {
      this.printInstallationStep(`Failed to download RCO3: ${error}
You may need to rerun as an administrator.`, 'Error')
      await new Promise(r => setTimeout(r, 1000))
      throw error;
    }
  }
  /** Launch RCO3 */
  public async launchRCO3() {
    if (existsSync(path.join(this.RootDir, 'index.js')))
      execSync('node index.js', {
        stdio: 'inherit',
        cwd: this.RootDir
      })
    else if (existsSync(path.join(this.RootDir, 'RCO.exe')))
      execSync(path.join(this.RootDir, 'RCO.exe'), {
        stdio: 'inherit'
      })
    else
      throw new Error('RCO not found')
    proc.exit()
  }
  private center(text: string) {
    return this.TTYText.center(text)
  }
  private align(text: string) {
    return this.TTYText.align(text)
  }
  constructor(rootDir?: string | undefined) {
    this.RootDir = rootDir ?? this.RootDir
  }

  // Copy proc.execPath to dir
  copySelf() {
    if (fs.existsSync(this.RootDir + '/RCO3Installer.exe'))
      fs.unlinkSync(this.RootDir + '/RCO3Installer.exe')
    if (fs.existsSync(this.RootDir + '/RCO2Installer.exe'))
      fs.unlinkSync(this.RootDir + '/RCO2Installer.exe')
    fs.copyFileSync(proc.execPath, this.RootDir + '/RCO3Installer.exe')
    fs.createSymlinkSync(this.RootDir + '/RCO3Installer.exe', this.RootDir + '/RCO2Installer.exe')
  }

  /** Returns the Title/Credits */
  getTitleCredits() {
    return this.center(`
${ansi.rgb(241, 76, 76)}${ansi.bold()}RCO3 ${ansi.rgb(59, 142, 234)}Installer${ansi.reset()}
${ansi.rgb(122, 122, 122)}RCO is owned, developed and maintained by Expo, Kaede and L8X${ansi.reset()}`)
  }
  getFossNotice() {
    return this.center(`${ansi.reset()}${ansi.rgb(122, 122, 122)}If you paid for this software, you have been scammed. RCO is free and open source.
You can download it (and it's source) at https://rco.simulhost.com/${ansi.reset()}`)
  }

  /** Clear Console */
  private clear() {
    try {
      console.log('\n'.repeat(proc.stdout.rows - 2));
    } catch (e) {
      console.clear()
    }
  }
  /** Global Installer Menu */
  printTitleCredits() {
    this.clear();
    console.log(this.getTitleCredits());
  }
  /** Outdated Menu */
  printOutdatedMenu() {
    console.log(this.center(`${ansi.reset()}
Outdated Installer Detected!
${this.align(`${ansi.rgb(241, 76, 76)}${ansi.bold()}i${ansi.reset()}${ansi.rgb(122, 122, 122)} - Download & Open new Installer
${ansi.rgb(241, 76, 76)}${ansi.bold()}c${ansi.reset()}${ansi.rgb(122, 122, 122)} - Continue
${ansi.rgb(241, 76, 76)}${ansi.bold()}q${ansi.reset()}${ansi.rgb(122, 122, 122)} - Quit`)}
`))
  }
  /** Main Menu */
  printMainMenu() {
    console.log(this.center(`${ansi.reset()}
Actions:
${this.align(`${ansi.rgb(241, 76, 76)}${ansi.bold()}i${ansi.reset()}${ansi.rgb(122, 122, 122)} - Install
${ansi.rgb(241, 76, 76)}${ansi.bold()}u${ansi.reset()}${ansi.rgb(122, 122, 122)} - Uninstall
${ansi.rgb(241, 76, 76)}${ansi.bold()}q${ansi.reset()}${ansi.rgb(122, 122, 122)} - Quit`)}
`))
  }
  /** Launch Menu */
  printLaunchMenu() {
    console.log(this.center(`${ansi.reset()}
Actions:
${this.align(`${ansi.rgb(241, 76, 76)}${ansi.bold()}l${ansi.reset()}${ansi.rgb(122, 122, 122)} - Launch
${ansi.rgb(241, 76, 76)}${ansi.bold()}q${ansi.reset()}${ansi.rgb(122, 122, 122)} - Quit`)}
`))
  }
  /** Installation Step */
  printInstallationStep(step: string, installing: string | boolean = true) {
    this.printTitleCredits();
    console.log(this.center(`
${ansi.reset()}${ansi.rgb(122, 122, 122)}${typeof installing === 'boolean' ? (installing ? 'Installing' : 'Uninstalling') : installing}: ${ansi.reset()}${step}${ansi.reset()}
`));
    this.printFossNotice();
  }
  /** Foss Notice */
  printFossNotice() {
    console.log(this.getFossNotice());
  }
  /** Get Main Menu Input */
  async getMainMenuInput() {
    let key: string = '';
    while (!Object.keys(InstallKey).includes(key)) {
      key = await this.TTYText.readkey()
    }
    return InstallKey[key as keyof typeof InstallKey] as unknown as InstallAction
  }

  /** Ensures the Root Directory exists */
  ensureDir() {
    const rootDir = this.RootDir;
    try {
      fs.ensureDirSync(rootDir)
    } catch (error) {
      throw new Error('Failed to create root directory @ ' + rootDir + '! Please check your permissions and try again. You may need to run as administrator/root.')
    }
  }

  /** Ensures the Root Directory doesn't exist */
  ensureDirRemoved() {
    const rootDir = this.RootDir;
    try {
      if (fs.existsSync(rootDir)) {
        fs.removeSync(rootDir)
      }
    } catch (error) {
      throw new Error('Failed to remove root directory @ ' + rootDir + '! Please check your permissions and try again. You may need to run as administrator/root.')
    }
  }

  async addToStartupRegistry() {
    const rootDir = this.RootDir;
    const regeditCommand = `REG ADD HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run /v RCO2 /t REG_SZ /d "${rootDir}\\RCO.exe" /f`;
    return new Promise<void>((resolve, reject) => {
      exec(regeditCommand, (error) => {
        if (error) {
          console.error('Registry error, RCO not added to startup...');
          reject(error)
        } else resolve(void 0)
      });
    })
  }

  removeFromStartupRegistry() {
    const regeditCommand = 'REG DELETE HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run /v RCO2 /f';
    return new Promise<void>((resolve, reject) => {
      exec(regeditCommand, (error) => {
        if (error) {
          console.error('Registry error, RCO not added to startup...');
          reject(error)
        } else resolve(void 0)
      });
    })
  }
}
