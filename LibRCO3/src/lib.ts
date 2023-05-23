import { Defaultable } from "./Defaultable";
import RCO3Flags from "./Flags";
import { Oof } from './Oof'
import { Roblox } from "./Roblox";

/** The main class exposed directly to library-users */
export class RCO3 {
  /**
   * {@link Defaultable} Library - Allows for default values for properties via Defaultable<T>.value
   */
  static Defaultable = Defaultable;
  /**
   * {@link RCO3Flags} Library - Handles fetching, and, assuming {@link RCO3Flags}.{@link RCO3Flags.init init(Roblox)} is called, periodically updating the flags.
   */
  static Flags = RCO3Flags;
  /**
   * {@link Oof} Library - Replaces the shitty Roblox Oof sound with the OG one
   */
  static Oof = Oof;
  /**
   * {@link Roblox} Library - Handles Locating Roblox
   */
  static Roblox = Roblox;
}
