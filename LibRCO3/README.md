## Table of Contents

- [RCO3 JS Library](#rco3-js-library)
  - [Usage Examples](#usage-examples)
    - [Minimal Usage Example](#minimal-usage-example)
    - [Overwrites, Awaits, `import`s](#overwrites-awaits-imports)


# RCO3 JS Library

[Docs](https://roblox-client-optimizer.simulhost.com/lib/docs/classes/lib.RCO3.html) | [NPM](https://www.npmjs.com/package/@rco3/lib) | [Source](https://github.com/L8X/Roblox-Client-Optimizer/tree/main/LibRCO3)

A NodeJS Library for RCO3.

## Usage Examples

### Minimal Usage Example

```ts
const { RCO3 } = require('@rco3/lib');
const { Oof } = RCO3;
const roblox = new RCO3.Roblox();
const flags = new RCO3.Flags();

Oof.Install(roblox);
flags.Install(roblox);
```

### Overwrites, Awaits, `import`s

```ts
import { existsSync, readFileSync } from 'fs';
import { RCO3 } from '.';

const overwrites = existsSync('./overwrites.json') ? JSON.parse(readFileSync('./overwrites.json', 'utf-8')) : {};

const roblox = new RCO3.Roblox();
const flags = new RCO3.Flags(overwrites);
const oof = new RCO3.Oof();

(async () => {
  console.log('Installing');
  await flags.Install(roblox);
  await oof.Install(roblox);
  console.log('Done!');
})();
```
