import fs from "fs-extra";
import path from "path";
import process from "process";
import { Oof } from "./Oof";

const { existsSync: exists } = fs

const unique = <T>(value: T, index: number, self: T[]): boolean => self.indexOf(value) === index

/** Handles finding Roblox & whatnot */
export class Roblox {
  /**
   * Roblox Path Getters
   * @internal
   */
  static RobloxPathGetters: Partial<Record<typeof process.platform, () => (string[])>> = {
    darwin: () => [process.env.ROBLOX, '/Applications/Roblox.app'].filter(v => v && exists(v)) as string[],
    win32: () => {
      const possible = [
        process.env.ROBLOX,
        path.resolve(process.env.LOCALAPPDATA ?? '', 'Roblox'),
        'C:/Program Files (x86)/Roblox',
        path.resolve(process.env.APPDATA ?? '', 'Roblox'),
      ].filter(v => v && exists(v) && exists(v + '/Versions')) as string[];
      if (possible.length > 0)
        return possible
      throw new Error(`Cannot find Roblox! Please symlink ${path.resolve(process.env.LOCALAPPDATA ?? 'C:/Program Files (x86)', 'Roblox', 'Versions')} to your Roblox's Versions Folder!`)
    },
    linux: () => {
      const possible = [
        process.env.ROBLOX, ...([
          '/',
          process.env.HOME,
          process.env.LOCALAPPDATA,
          process.env.APPDATA,
        ].filter(v => v).map(v => path.resolve(v ?? '', 'Roblox')))].filter(v => v && exists(v) && exists(path.resolve(v, 'Versions'))) as string[];
      // if (possible.length > 1 && !process.env.ROBLOX && !process.env.IGNORE_MULTIPLE_ROBLOX_INSTALLATIONS)
      //         throw new Error(`Found multiple Roblox installations! Please remove all but one, pass the ROBLOX Environment Variable to set exactly 1 Roblox installation, or IGNORE_MULTIPLE_ROBLOX_INSTALLATIONS to ignore this error.
      // Installations: ${possible.join(', ')}`)
      if (possible.length > 0)
        return possible
      throw new Error(`Cannot find Roblox! Please symlink ${path.resolve(process.env.ROBLOX ?? '/Roblox', 'Versions')} to your Roblox's Versions Folder or set the ROBLOX env variable to the directory containing your Roblox's Versions directory!`)
    }
  }
  /** Gets the Roblox Paths for the current autodetected platform */
  static GetRobloxPaths = this.RobloxPathGetters[process.platform]
  /**
   * Gets the Roblox Version from the path
   * @param {string} p The path to get the version from
   * @note On MacOS, this will always return [`Contents`], as there is no version directory system on MacOS
   */
  static GetRobloxVersionsFromPath(p: string) {
    if (process.platform === 'darwin')
      return ['Contents']
    if (!p)
      throw new Error('No Path Specified')
    if (!exists(p))
      throw new Error('Path does not exist')
    p = path.resolve(p)
    const versionsDir = p.endsWith('Versions') ? p : path.join(p, 'Versions')
    if (!exists(versionsDir))
      throw new Error('Versions directory does not exist')
    const versions = fs.readdirSync(versionsDir)
    if (!versions.length)
      throw new Error('Versions directory is empty')
    if (process.env.NO_STUDIO) {
      const playerVersion = versions.filter(v => fs.existsSync(path.join(versionsDir, v, 'RobloxPlayerBeta.exe')))
      if (!playerVersion)
        throw new Error('No RobloxPlayerBeta.exe found in Versions directory')
      return playerVersion
    } else return versions
  }
  /**
   * {@link GetRobloxVersionsFromPath} but returns the absolute dir path
   */
  static GetRobloxVersionDirFromPath(p: string) {
    return this.GetRobloxVersionsFromPath(p).map(v => path.resolve(p, process.platform === 'darwin' ? '.' : 'Versions', v))
  }
  /** Gets Client Settings Path from a version folder */
  static getClientSettings(versionDir: string) {
    switch (process.platform) {
      case 'darwin':
        return path.join(versionDir, 'MacOS', 'ClientSettings', 'ClientAppSettings.json')
      case 'win32':
      case 'linux':
        return path.join(versionDir, 'ClientSettings', 'ClientAppSettings.json')
    }
    if (!process.env.ROBLOXCAS)
      throw new Error('Unsupported Platform - Please pass the environment variable ROBLOXCAS to specify the path to Roblox ClientAppSettings.json relative to ' + versionDir)
    else
      return path.resolve(versionDir, process.env.ROBLOXCAS)
  }
  /** The paths to Roblox('s Versions Folder) */
  #robloxPaths: string[] = [];
  /** The paths to Roblox('s Versions Folder) */
  get robloxPaths(): string[] {
    return this.#robloxPaths.filter(v => v && exists(v)).filter(unique)
  }
  /** The paths to Roblox('s Versions Folder) */
  set robloxPaths(v: string[] | string) {
    if (typeof v === 'string')
      this.#robloxPaths = [v]
    else
      this.#robloxPaths = v
  }
  /** Run something on each path */
  each<T>(f: (robloxPath: string, index: number, robloxPaths: string[]) => T): T[] {
    return this.robloxPaths.map(f)
  }
  /** Run something on each path */
  map<T>(f: (robloxPath: string, index: number, robloxPaths: string[]) => T): T[] {
    return this.robloxPaths.map(f)
  }
  /** Run something on each path, flattening it after */
  flatMap<T>(f: (robloxPath: string, index: number, robloxPaths: string[]) => (T | T[])): T[] {
    return this.robloxPaths.flatMap(f)
  }
  /** Return value of {@link Roblox.getClientSettings GCS} for this Roblox Instance */
  get ClientAppSettings() {
    return this.each(p => Roblox.getClientSettings(p))
  }
  /** oof path for this client */
  get Oof() {
    return this.each(p => path.resolve(p, Oof.oofPath))
  }
  /** Sets the flags to a JSON object */
  setFlags(flags: Record<string, any>) {
    this.ClientAppSettings.forEach(cas => {
      fs.ensureFileSync(cas)
      fs.writeFileSync(cas, JSON.stringify(flags))
    })
  }
  /** Deletes all flag objects */
  delFlags() {
    this.setFlags({})
    this.ClientAppSettings.forEach(cas => {
      if (exists(cas))
        fs.unlinkSync(cas)
    })
  }
  /** Finds all Roblox Version Paths */
  discoverRobloxPaths() {
    const rbx = (Roblox.GetRobloxPaths ?? (() => { throw new Error('Must specify Roblox Path or be on supported platform!') }))()
    const newPaths = rbx.flatMap(dir => Roblox.GetRobloxVersionDirFromPath(dir))
    const oldPaths = this.robloxPaths;
    this.robloxPaths = [
      ...newPaths,
      ...oldPaths
    ].filter((value, index, self) => unique(value, index, self) && exists(value))
    return newPaths
  }
  /** Roblox Discovered Listeners */
  robloxDiscoveredListeners: ((paths: string[]) => void)[] = []
  /** Adds a Roblox Discovered Listener */
  addRobloxDiscoveredListener(f: (paths: string[]) => void) {
    this.robloxDiscoveredListeners.push(f)
  }
  /** Removes a Roblox Discovered Listener */
  removeRobloxDiscoveredListener(f: (paths: string[]) => void) {
    this.robloxDiscoveredListeners = this.robloxDiscoveredListeners.filter(v => v !== f)
  }
  /** Calls all Roblox Discovered Listeners */
  callRobloxDiscoveredListeners() {
    this.robloxDiscoveredListeners.forEach(f => f(this.robloxPaths))
  }
  /**
   * @param {string[]|string} robloxPaths The path to Roblox's Versions Folder
   */
  init(robloxPaths?: string[] | string) {
    if (typeof robloxPaths === 'string')
      robloxPaths = [robloxPaths]
    if (!robloxPaths) {
      robloxPaths = this.discoverRobloxPaths()
      setInterval(() => {
        const newPaths = this.discoverRobloxPaths()
        if ([...robloxPaths ?? [], ...newPaths].filter(unique).length !== robloxPaths?.length ?? -1) {
          this.robloxPaths = newPaths.filter(unique)
          this.callRobloxDiscoveredListeners()
        }
      }, 2000)
    }
    this.robloxPaths = robloxPaths
  }
  /**
   * Calls {@link Roblox}.{@link Roblox.init init(paths)} with {@link robloxPaths}
   * @param {string[]|string} robloxPaths The path to Roblox's Versions Folder
   */
  constructor(robloxPaths?: string[] | string) {
    if (typeof robloxPaths === 'string')
      robloxPaths = [robloxPaths]
    this.init(robloxPaths)
  }
}