// @flow
// @format

import React from 'react';

import Page from './Page';

export type FileIO = {|
  listFiles: () => Array<string>, // list of file names
  readFile: (filename: string) => string,
  writeFile: (filename: string, contents: string) => void,
|};

export default function App({fileIO}: {fileIO: FileIO}) {
  return (
    <div>
      <Page />
    </div>
  );
}
