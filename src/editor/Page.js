// @flow
// @format

import React, {useState, useCallback} from 'react';
import {Editor} from 'slate-react';
import {Value} from 'slate';

import useDelayedCallback from './useDelayedCallback';
import IndentableLine, {LINE_TYPE, DEFAULT_LINE_NODE} from './IndentableLine';
import UnorderedListItemPrefix, {
  UNORDERED_LIST_ITEM_TYPE,
  unorderedListItemPrefixTextToData,
} from './UnorderedListItemPrefix';
import CheckboxPrefix, {
  CHECKBOX_ITEM_TYPE,
  checkboxPrefixTextToData,
} from './CheckboxPrefix';

const FILE_SAVE_DELAY = 1500; //ms
const MAX_INDENT_LEVEL = 14;
const INDENT_WIDTH = 20;

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
    nodes: [DEFAULT_LINE_NODE],
  },
});

const plugins = [
  IndentableLine(MAX_INDENT_LEVEL, INDENT_WIDTH, {
    [UNORDERED_LIST_ITEM_TYPE]: unorderedListItemPrefixTextToData,
    [CHECKBOX_ITEM_TYPE]: checkboxPrefixTextToData,
  }),
  UnorderedListItemPrefix(INDENT_WIDTH),
  CheckboxPrefix(INDENT_WIDTH),
];

export default function Page() {
  const [value, setValue] = useState(initialValue);
  const [selection, setSelection] = useState(null);
  const delayCallback = useDelayedCallback(
    FILE_SAVE_DELAY,
    useCallback(() => console.log('saved'), []),
  );
  return (
    <div>
      <Editor
        schema={schema}
        value={value}
        onChange={({value}) => {
          setValue(value);
          setSelection(value.selection);
          delayCallback();
        }}
        plugins={plugins}
      />
      <pre>{selection && JSON.stringify(selection.toJSON(), null, '  ')}</pre>
      <pre>{JSON.stringify(value.toJSON(), null, '  ')}</pre>
    </div>
  );
}
