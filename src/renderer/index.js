// @flow
// @format

// This is the electron app entry point

import fs from 'fs';
import path from 'path';
import {remote} from 'electron';
import mkdirp from 'mkdirp';

import editor from './editor';

const USER_DATA_DIR = remote.app.getPath('userData');
const FILES_DIR = 'files';

const fileIO = {
  listFiles: () => {
    throw new Error('NYI');
  },
  readFile: filename => {
    const filepath = path.join(USER_DATA_DIR, FILES_DIR, filename);
    if (!fs.existsSync(filepath) || !fs.lstatSync(filepath).isFile()) {
      return null;
    }
    return fs.readFileSync(filepath, 'utf8');
  },
  writeFile: (filename, contents) => {
    const filepath = path.join(USER_DATA_DIR, FILES_DIR, filename);
    mkdirp.sync(path.join(USER_DATA_DIR, FILES_DIR));
    console.log('wrote', filepath);
    fs.writeFileSync(filepath, contents, 'utf8');
  },
};

editor('app', fileIO);
