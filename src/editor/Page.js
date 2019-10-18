// @flow
// @format

import React, {useState, useCallback} from 'react';
import {Editor} from 'slate-react';
import {Value} from 'slate';

import useDelayedCallback from './useDelayedCallback';
import Line, {LINE_TYPE, DEFAULT_LINE_NODE} from './Line';
import UnorderedListItemPrefix, {
  UNORDERED_LIST_ITEM_TYPE,
  unorderedListItemPrefixTextToData,
} from './UnorderedListItemPrefix';
import CheckboxPrefix, {
  CHECKBOX_ITEM_TYPE,
  checkboxPrefixTextToData,
} from './CheckboxPrefix';
import {moveLineUp} from './shortcuts';
import Indentable from './plugins/Indentable';

const FILE_SAVE_DELAY = 1500; //ms
const SHOW_SAVED_NOTICE = 2000; //ms
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
  Indentable({
    indentWidth: 20,
    maxIndentLevels: 10,
  }),
  Line(),
];

type Props = {
  value: Value,
  onChange: (newValue: Value) => void,
  onSave: (newValue: Value) => void,
};

export default function Page(props: Props) {
  const value = props.value || initialValue;

  const [showSaved, setShowSaved] = useState(false);
  const delayHideSavedNotice = useDelayedCallback(
    SHOW_SAVED_NOTICE,
    useCallback(() => {
      setShowSaved(false);
    }, [setShowSaved]),
  );

  const [selection, setSelection] = useState(null);
  const delaySave = useDelayedCallback(
    FILE_SAVE_DELAY,
    useCallback(
      valueToSave => {
        props.onSave(valueToSave);
        setShowSaved(true);
        delayHideSavedNotice();
      },
      [props.onSave],
    ),
  );

  const [showDebug, setShowDebug] = useState(false);

  let debug = null;
  if (showDebug) {
    debug = (
      <div>
        <pre>{selection && JSON.stringify(selection.toJSON(), null, '  ')}</pre>
        <pre>{JSON.stringify(value.toJSON(), null, '  ')}</pre>
      </div>
    );
  }
  return (
    <div>
      <Editor
        schema={schema}
        value={value}
        onChange={change => {
          const newValue = change.value;
          props.onChange(newValue);
          setSelection(newValue.selection);
          if (newValue.document !== value.document) {
            delaySave(newValue);
          }
        }}
        plugins={plugins}
      />
      <p>
        <button onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? 'Hide debug' : 'Show debug'}
        </button>
      </p>
      {showSaved ? <p>Saved</p> : null}
      {debug}
    </div>
  );
}
