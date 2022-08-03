'use strict';

const fs = require('fs-extra');
const process = require('process');
const path = require('path');

const items = fs.readdirSync(__dirname);

if(!items.includes('node_modules')) {
    return;
}

const cacheFolderLocation = path.join(__dirname, 'node_modules/.cache');
const binFolderLocation = path.join(__dirname, 'node_modules/.bin');
console.log(binFolderLocation)

fs.removeSync(cacheFolderLocation);
fs.removeSync(binFolderLocation);