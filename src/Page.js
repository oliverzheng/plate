// @flow
// @format

import React, {useState} from 'react';
import {Editor} from 'slate-react';
import {Value} from 'slate';

import IndentableLine, {LINE_TYPE, DEFAULT_LINE_DATA} from './IndentableLine';

const MAX_INDENT_LEVEL = 10;
const INDENT_WIDTH = 30;

const schema = {
  document: {
    nodes: [
      {
        match: [{type: LINE_TYPE}],
      },
    ],
  },
};

const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: LINE_TYPE,
        data: {
          ...DEFAULT_LINE_DATA,
        },
        nodes: [
          {
            object: 'text',
            text: 'A line of text in a paragraph.',
          },
        ],
      },
    ],
  },
});

const plugins = [IndentableLine(MAX_INDENT_LEVEL, INDENT_WIDTH)];

export default function Page() {
  const [value, setValue] = useState(initialValue);
  return (
    <div>
      <Editor
        schema={schema}
        value={value}
        onChange={({value}) => setValue(value)}
        plugins={plugins}
      />
      <pre>{JSON.stringify(value.toJSON(), null, '  ')}</pre>
    </div>
  );
}
