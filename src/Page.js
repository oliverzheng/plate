// @flow
// @format

import React, {useState} from 'react';
import {Editor} from 'slate-react';
import {Value} from 'slate';

import IndentableLine from './IndentableLine';

const INDENT_WIDTH = 30;

const schema = {
  document: {
    nodes: [
      {
        match: [{type: 'line'}],
      },
    ],
  },
  blocks: {
    line: {
      data: {
        indentLevel: l => typeof l === 'number' && l >= 0,
      },
      nodes: [
        {
          match: [{type: 'oli'}, {type: 'uli'}],
          min: 0,
          max: 1,
        },
        {
          match: {object: 'text'},
          min: 1,
          max: 1,
        },
      ],
    },
  },
  inlines: {
    oli: {
      data: {
        listNumber: n => n == null || (typeof n === 'number' && n >= 0),
      },
      nodes: [],
    },
    uli: {
      nodes: [],
    },
  },
};

const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'line',
        data: {
          indentLevel: 0,
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

const plugins = [IndentableLine('line', INDENT_WIDTH)];

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
