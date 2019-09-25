// @flow
// @format

// This is the electron app entry point

import editor from '../editor';

const fileIO = {
  listFiles: () => {
    throw new Error('NYI');
  },
  readFile: filename => {
    throw new Error('NYI');
  },
  writeFile: (filename, contents) => {
    throw new Error('NYI');
  },
};

editor('root', fileIO);
