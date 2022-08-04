'use strict';

const fs = require('fs-extra');
const childProcess = require('child_process');
const path = require('path');

const items = fs.readdirSync(__dirname);

if(!items.includes('node_modules')) {
    console.log('No node modules folder found, installing libraries now');
    childProcess.execSync('npm i')
    console.log('You can now edit the files in node_modules/chart.js and run this command again');
    process.exit(0);
}

console.log('Removing old bin and cache folder in node modules');

const cacheFolderLocation = path.join(__dirname, 'node_modules/.cache');
const binFolderLocation = path.join(__dirname, 'node_modules/.bin');

fs.removeSync(cacheFolderLocation);
fs.removeSync(binFolderLocation);

console.log('Rebuilding node modules and starting dev server, if you make changes in the internal files you will need to run this command again');

childProcess.execSync('npm i');
childProcess.execSync('npm run start-server');
