import prompts from 'prompts';
import { RCO3 } from '@rco3/lib';
import path from 'path';
import { ensureFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'fs-extra';
import process from 'process';
const {
  Flags,
  Oof,
  Roblox,
} = RCO3;
const JSONTryParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
const unstableFlags: string[] = [
  'FFlagEnableQuickGameLaunch',
]
const extraGraphicsFlags: string[] = [
  'FFlagFixGraphicsQuality',
  'FFlagCommitToGraphicsQualityFix',
]
const RenderFlags: Record<string, string> = {
  'FFlagDebugGraphicsPreferD3D11': 'Direct3D11',
  'FFlagDebugGraphicsPreferD3D11FL10': 'Direct3D10',
  'FFlagDebugGraphicsPreferOpenGL': 'OpenGL',
  'FFlagDebugGraphicsPreferVulkan': 'Vulkan',
}
export default async () => {
  // Save & Set Title
  const title = process.title
  process.title = 'RCO Configurator'

  // Get Flags Object
  const flags = new Flags();
  // Get Flags Path
  const customFlagsPath = path.join(flags.root, 'customflags.json');
  // Load Flag Overwrites
  const flagOverwrites = existsSync(customFlagsPath) ? JSONTryParse(readFileSync(customFlagsPath, 'utf-8')) ?? {} : {};
  // Get NoOof file path
  const rcoNoOofPath = path.join(flags.root, '.rconooof');

  // Misc Functions
  /** Saves Flag Overwriteis */
  const saveFlags = () => {
    ensureFileSync(customFlagsPath);
    writeFileSync(customFlagsPath, JSON.stringify(flagOverwrites, null, 2));
  }
  /** Sets Target Framerate */
  const setFPSCap = async (cap: number) => {
    flagOverwrites.DFIntTaskSchedulerTargetFps = cap;
    saveFlags()
  }
  /** Sets oof enabled */
  const setOofEnabled = async (shouldOof: boolean) => {
    if (shouldOof) {
      if (existsSync(rcoNoOofPath))
        rmSync(rcoNoOofPath);
    }
    else if (!existsSync(rcoNoOofPath)) {
      ensureFileSync(rcoNoOofPath);
      const oof = new Oof();
      await oof.Uninstall();
    }
  }
  /** Sets specific flags */
  const setFlagList = (flags: string[], value: boolean) => {
    for (let flag of flags) {
      let val = value;
      if (flag.startsWith('!')) {
        flag = flag.slice(1);
        val = !val;
      }
      flagOverwrites[flag] = val;
    }
  }
  /** Sets unstable flags enabled */
  const setUnstableFlags = async (shouldUnstable: boolean) => setFlagList(unstableFlags, shouldUnstable)
  /** Sets extra graphics flags enabled */
  const setExtraGraphicsFlags = async (shouldExtraGraphics: boolean) => setFlagList(extraGraphicsFlags, shouldExtraGraphics)
  /** Sets Rendering Engine */
  const setRenderingEngine = async (renderingEngineFlag: keyof typeof RenderFlags) => {
    if (renderingEngineFlag !== 'FFlagDebugGraphicsPreferD3D11')
      flagOverwrites.FFlagDebugGraphicsDisableDirect3D11 = true;
    else
      delete flagOverwrites.FFlagDebugGraphicsDisableDirect3D11;
    for (const key in RenderFlags)
      flagOverwrites[key] = false;
    flagOverwrites[renderingEngineFlag] = true;
    saveFlags();
  }

  // Prompt for ShouldOof
  await setOofEnabled((await prompts(
    {
      name: 'shouldOof',
      type: 'confirm',
      message: 'Should RCO replace the Roblox Oof sound?',
      hint: 'Replaces roblox\'s moan with the OG oof',
      initial: !existsSync(rcoNoOofPath),
    }
  )).shouldOof);

  // Prompt for ShouldIncludeUnstableFlags
  await setUnstableFlags((await prompts(
    {
      name: 'shouldUnstable',
      type: 'confirm',
      message: 'Should RCO include unstable fflags?',
      hint: 'This should likely be enabled',
      initial: true,
    }
  )).shouldUnstable);

  // Prompt for FPS Cap
  await setFPSCap((await prompts(
    {
      name: 'fpsLimit',
      type: 'number',
      message: 'What should Roblox\'s FPS cap be?',
      initial: flagOverwrites.DFIntTaskSchedulerTargetFps ?? 144,
      min: 1,
      max: 8092,
    }
  )).fpsLimit);

  // Prompt for Extra Graphics Flags
  await setExtraGraphicsFlags((await prompts(
    {
      name: 'shouldExtraGraphics',
      type: 'confirm',
      message: 'Should RCO include extra graphics fflags?',
      hint: 'This adds the extra graphics options',
      initial: true,
    }
  )).shouldExtraGraphics);

  // Get Current Rendering Engine
  const currentRenderingEngine = Object.keys(RenderFlags).find(key => flagOverwrites[key]);

  // Prompt for Rendering Engine
  await setRenderingEngine((await prompts(
    {
      name: 'renderingEngine',
      type: 'select',
      message: 'Which rendering engine should Roblox use?',
      // initial: 'FFlagDebugGraphicsPreferD3D11',
      choices: Object.entries(RenderFlags).map(([key, value]) => ({ title: value, value: key })),
      initial: (v => v >= 0 ? v : undefined)(Object.keys(RenderFlags).indexOf(currentRenderingEngine ?? '')),
    }
  )).renderingEngine);

  // Set title back
  process.title = title;
}