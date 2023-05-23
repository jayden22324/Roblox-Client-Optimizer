import fs from 'fs-extra'
import path from 'path'
import { HTTP } from '@rco3/ttyutil'
import { Defaultable } from './Defaultable';
import { Roblox } from './Roblox';

const dirname = eval('__dirname')

/**
 * Basic Flags Handler
 */
export class RCO3Flags {
  /**
   * where we store shit
   */
  root!: string;
  /**
   * overwrites for flags
   */
  overrides!: Record<string, string | number | boolean>;
  /**
   * list of flags currently in use
   */
  flags: Record<string, string | number | boolean> = {};
  /**
   * base flag url
   */
  baseURL = 'https://roblox-client-optimizer.simulhost.com';
  /**
   * the current flag hash/id, excludes overrides
   */
  flagHash!: string;
  constructor(overrides: Record<string, string | number | boolean> = {}, root: string = dirname) {
    this.construct(overrides, root);
  }
  /** Init function */
  construct(overrides?: Record<string, string | number | boolean>, root?: string) {
    this.root = root ?? this.root
    this.overrides = overrides ?? this.overrides
    this.flagHash = fs.existsSync(path.join(this.root, 'ClientAppSettings.json.sha512')) ? fs.readFileSync(path.join(this.root, 'ClientAppSettings.json.sha512'), 'utf-8').trim() : ''
    this.flags = fs.existsSync(path.join(this.root, 'ClientAppSettings.json')) ? {
      ...JSON.parse(fs.readFileSync(path.join(this.root, 'ClientAppSettings.json'), 'utf-8')),
      ...this.overrides,
    } : {}
  }
  /** Post-Write Listeners */
  private _postWriteListeners: ((flags: typeof this.flags) => void)[] = []
  /**
   * Sets the post-write callback
   */
  onWrite(callback: (flags: typeof this.flags) => void) {
    this._postWriteListeners = [...this._postWriteListeners, callback]
  }
  #interval?: NodeJS.Timeout;
  /** Initializes the flag list, and sets an interval to consistently fetch it */
  async init(roblox?: Roblox) {
    if (roblox)
      this.onWrite((flags) =>
        roblox.setFlags(flags)
      )
    await this.updateFlagsList()
    this.#interval = setInterval(this.updateFlagsList.bind(this), 1000 * 60 * 60).unref()
  }
  /** Uninitializes the flag list, required for uninstalling */
  uninit() {
    if (this.#interval) {
      clearInterval(this.#interval)
      this.#interval = undefined
    }
  }
  /** One-Time Flag List Install */
  async Install(roblox: Roblox = new Roblox()) {
    await this.updateFlagsList(true)
    roblox.setFlags(this.flags)
  }
  /** One-Time Flag List Removal */
  async Uninstall(roblox: Roblox = new Roblox()) {
    roblox.delFlags()
  }
  /**
   * Writes the flags to disk
   */
  _writeFlags() {
    fs.writeFileSync(path.join(this.root, 'ClientAppSettings.json'), JSON.stringify(this.flags, null, 2))
    fs.writeFileSync(path.join(this.root, 'ClientAppSettings.json.sha512'), this.flagHash)
    this._postWriteListeners.forEach(listener => listener(this.flags))
  }
  /**
   * Client App Settings URL
   */
  readonly clientAppSettingsURL = new Defaultable(() => `${this.baseURL}/ClientAppSettings.json`)
  /**
   * Client App Settings Hash URL
   */
  readonly clientAppSettingsHashURL = new Defaultable(() => `${this.baseURL}/ClientAppSettings.json.sha512`)
  /**
   * Updates the flag list on hash missmatch
   * @param {boolean} callWrite Whether or not to write the flags to disk - Should rarely be set to false
   * @returns {Promise<void>}
   */
  async updateFlagsList(callWrite: boolean = true): Promise<void> {
    const flagHash = (await HTTP.Get(this.baseURL + '/ClientAppSettings.json.sha512')).trim()
    if (flagHash !== this.flagHash) {
      const flags = await HTTP.GetJSON(this.clientAppSettingsURL.value) as Record<any, any>
      this.flags = {
        ...flags,
        ...this.overrides,
      }
      this.flagHash = flagHash
      if (callWrite) this._writeFlags()
    }
  }
}
export default RCO3Flags