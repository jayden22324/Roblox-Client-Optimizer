const fs = require('fs');
const { execSync } = require('child_process');

/**
 * @type {<T>(arrays: T[][]) => T[][]}
 */
const comb = (arrays) => {
  if (!arrays || !arrays.length) {
    return [];
  }
  if (arrays.length === 1) {
    return arrays[0].map(x => [x]);
  }
  const [first, ...rest] = arrays;
  const combinations = comb(rest);
  return first.flatMap(x => combinations.map(y => [x, ...y]));
}

const matrix = [
  ...comb([['linux'], ['amd64', 'arm64', '386']]),
  ...comb([['windows'], ['amd64', '386']]),
  ...comb([['darwin'], ['amd64', 'arm64']])
];

if (!fs.existsSync('./bin'))
  fs.mkdirSync('./bin');
if (!fs.existsSync('./bin/rco3-launcher'))
  fs.mkdirSync('./bin/rco3-launcher');

const cmd = (platform, arch, posDependent) => `go build -o "bin/rco3-launcher/${platform}-${arch}${platform === 'windows' ? '.exe' : ''}"${posDependent ? ' -ldflags="-no-pie"' : ''} main.go`
const run = (cmd, plat, arch, i, a) => {
  console.log(`\x1B[90m[\x1B[92m${i}/${a}\x1B[90m] \x1B[94m$\x1B[0m ${cmd}`);
  execSync(cmd, {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: {
      ...process.env,
      GOOS: plat,
      GOARCH: arch,
    }
  })
}
matrix.forEach(([plat, arch], i, a) => {
  try {
    run(cmd(plat, arch, false), plat, arch, i, a.length - 1,)
  } catch (error) {
    run(cmd(plat, arch, true), plat, arch, i, a.length - 1,)
  }
})
