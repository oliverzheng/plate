// @flow
// @format

import React, {useState, useMemo} from 'react';
import {Value} from 'slate';

import Page from './Page';

export type FileIO = {|
  listFiles: () => Array<string>, // list of file names
  readFile: (filename: string) => ?string,
  writeFile: (filename: string, contents: string) => void,
|};

const DEFAULT_FILENAME = 'defaultfile';

type Props = {
  fileIO: FileIO,
};

export default function App({fileIO}: Props) {
  const initialFileValue = useMemo(() => {
    const fileContents = fileIO.readFile(DEFAULT_FILENAME);
    if (!fileContents) {
      return null;
    }
    return Value.fromJSON(JSON.parse(fileContents));
  }, [fileIO.readFile]);
  const [value, setValue] = useState(initialFileValue);
  return (
    <div>
      <Page
        value={value}
        onChange={newValue => {
          setValue(newValue);
        }}
        onSave={newValue => {
          fileIO.writeFile(
            DEFAULT_FILENAME,
            JSON.stringify(newValue.toJSON(), null, '  '),
          );
        }}
      />
    </div>
  );
}
