// @flow
// @format

import React, {useState, useMemo} from 'react';
import {Value} from 'slate';

import Page from './Page';
import {serializeDocument, deserializeToDocument} from './serializer';

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
    const document = deserializeToDocument(JSON.parse(fileContents));
    return Value.create({document});
  }, [fileIO.readFile]);
  const [value, setValue] = useState(initialFileValue);
  return (
    <div style={{padding: 20}}>
      <Page
        value={value}
        onChange={newValue => {
          setValue(newValue);
        }}
        onSave={newValue => {
          const serialized = serializeDocument(newValue.document);
          fileIO.writeFile(
            DEFAULT_FILENAME,
            JSON.stringify(serialized, null, '  '),
          );
        }}
      />
    </div>
  );
}
