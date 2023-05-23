import { HTTP } from "@rco3/ttyutil";
import { Roblox } from "./Roblox";
import path from "path";
import { copyFileSync, ensureDirSync, existsSync } from "fs-extra";
import { unlinkSync } from 'fs';

/** Handles oofs */
export class Oof {
  /**
   * oof url
   */
  static oofURL = 'https://roblox-client-optimizer.simulhost.com/ouch.ogg';
  /**
   * Downloads the oof to a specific file
   */
  static downloadOof(file: string): Promise<void> {
    return HTTP.Download(this.oofURL, file)
  }
  /**
   * Oof path within the roblox installation, relative to the version's root
   */
  static oofPath = 'content/sounds/ouch.ogg';
  /**
   * Download the oof to a Roblox Installation
   * @param {Roblox} roblox The Roblox Object
   */
  static async Install(roblox: Roblox = new Roblox()): Promise<void> {
    let firstOof: string | undefined = undefined;
    for (const oofPath of roblox.Oof) {
      ensureDirSync(path.dirname(oofPath))
      if (!firstOof) {
        firstOof = oofPath
        await Oof.downloadOof(oofPath)
      }
      else copyFileSync(firstOof, oofPath)
    }
  }
  /**
   * Uninstall the og based oof from a Roblox Installation
   */
  static async Uninstall(roblox: Roblox = new Roblox()): Promise<void> {
    roblox.Oof.filter(v => existsSync(v)).forEach(oofPath => {
      unlinkSync(oofPath)
    })
  }
  /** Non-Static Variant of {@link Oof.Install Oof.Install} */
  async Install(roblox: Roblox = new Roblox()) {
    return Oof.Install(roblox)
  }
  /** Non-Static Variant of {@link Oof.Install Oof.Uninstall} */
  async Uninstall(roblox: Roblox = new Roblox()) {
    return Oof.Uninstall(roblox)
  }
}
