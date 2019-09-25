// @flow
// @format

// This is the create-react-app web app entry point

import nullthrows from 'nullthrows';
import editor from './editor';
import type {FileIO} from './editor';

const FILE_PREFIX = 'file:';

const fileIO: FileIO = {
  listFiles: () => {
    const allKeys = Object.keys(window.localStorage);
    return allKeys
      .filter(k => k.startsWith(FILE_PREFIX))
      .map(k => k.substr(FILE_PREFIX.length));
  },
  readFile: filename => {
    const file = window.localStorage.getItem(FILE_PREFIX + filename);
    return nullthrows(file);
  },
  writeFile: (filename, contents) => {
    window.localStorage.setItem(FILE_PREFIX + filename, contents);
  },
};

editor('root', fileIO);
