// @flow
// @format

import React, {useState, useCallback} from 'react';
import {Editor} from 'slate-react';
import {Value} from 'slate';

import useDelayedCallback from './useDelayedCallback';
import Line, {LINE_TYPE, createLine} from './Line';
import Indentable from './plugins/Indentable';
import BulletPrefix from './plugins/BulletPrefix';
import CheckboxPrefix from './plugins/CheckboxPrefix';

const FILE_SAVE_DELAY = 1500; //ms
const SHOW_SAVED_NOTICE = 2000; //ms
const MAX_INDENT_LEVEL = 10;
const INDENT_WIDTH_IN_EM = 1.25;
const FONT_SIZE = 18;

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
    nodes: [createLine()],
  },
});

const plugins = [
  Indentable({
    indentWidthInEm: INDENT_WIDTH_IN_EM,
    maxIndentLevels: MAX_INDENT_LEVEL,
  }),
  BulletPrefix({prefixWidthInEm: INDENT_WIDTH_IN_EM}),
  CheckboxPrefix({
    prefixWidthInEm: INDENT_WIDTH_IN_EM,
    fontSizeInPx: FONT_SIZE,
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
    <div style={{lineHeight: '1.4em', fontSize: FONT_SIZE}}>
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
