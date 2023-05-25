if (!process.argv[2]) throw new Error("No input file specified!")

const fs = require('fs');
const memes = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const getMeme = () => memes[Math.floor(Math.random() * memes.length)];

const resedit = require('resedit-cli');
resedit.default({
  in: process.argv[2],
  out: process.argv[2],
  "product-name": "RCO3 Launcher",
  "file-description": Math.random() > 0.75 ? getMeme() : "Launches RCO3 using NodeJS. That's it.",
  "allowShrink": true,
  "allowGrow": true,
  "icon": process.argv[3] ?? "icon.ico",
  "file-version": "69.69.69.69",
  "product-version": "420.420.420.420",
  "original-filename": "rco-moment.exe",
  "internal-name": getMeme(),
  "company-name": "RCO",
})