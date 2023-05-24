// compiling nodejs from source is too slow for now, so for now we're using pkg - nexe might be useful in future however, so i'm leaving this here
const { compile } = require('nexe')

compile({
  input: './dist/index.js',
  build: true, //required to use patches
  name: 'rco3-installer',
  output: `./bin/rco3installer-${process.platform}${process.platform === 'win32' ? '.exe' : ''}`,
  ico: `${__dirname}/icon.ico`,
  rc: {
    CompanyName: 'RCO',
    ProductName: 'RCO3 Installer',
    FileDescription: 'RCO3 Installer',
    OriginalFilename: 'RCO3 Installer',
  },
  targets: [
    {
      platform: process.platform,
      arch: process.arch,
      version: process.versions.node
    }
  ]
}).then(() => {
  console.log('success')
})