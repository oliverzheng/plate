// @flow
// @format

import React from 'react';
import nullthrows from 'nullthrows';
import invariant from 'invariant';
import {Block, Inline, Text} from 'slate';
import Hotkeys from 'slate-hotkeys';

const CHECKBOX_PREFIX_DATA_KEY = 'checkboxPrefix';
export const CHECKBOX_PREFIX_DEFAULT_DATA = {
  [CHECKBOX_PREFIX_DATA_KEY]: null,
};
const UNCHECKED_PREFIXES = ['[] ', '[ ] '];
const CHECKED_PREFIXES = ['[x] ', '[X] '];
const CHECKBOX_SIZE = 15;
const MARGIN_RIGHT = 4;
const MARGIN_TOP = 2;

export function checkboxPrefixEnabled(editor: Object): boolean {
  return editor.hasQuery('getCheckboxPrefixWidth');
}

type TextCheckboxPrefix = {
  length: number,
  checked: boolean,
};

export function getTextCheckboxPrefix(
  editor: Object,
  text: string,
): ?TextCheckboxPrefix {
  if (!checkboxPrefixEnabled(editor)) {
    return null;
  }

  for (const prefix of UNCHECKED_PREFIXES) {
    if (text.startsWith(prefix)) {
      return {
        length: prefix.length,
        checked: false,
      };
    }
  }

  for (const prefix of CHECKED_PREFIXES) {
    if (text.startsWith(prefix)) {
      return {
        length: prefix.length,
        checked: true,
      };
    }
  }

  return null;
}

type CheckboxPrefixRender = {
  className: string,
  styleNode: React$Node,
};

export function renderCheckboxPrefix(
  editor: Object,
  node: Object,
): ?CheckboxPrefixRender {
  if (!checkboxPrefixEnabled(editor)) {
    return null;
  }
  if (!hasCheckboxPrefix(editor, node)) {
    return null;
  }

  const isChecked = isCheckboxPrefixChecked(editor, node);
  const CHECKBOX_PREFIX_CLASSNAME = `checkbox-prefix-node-${
    isChecked ? 'checked' : 'unchecked'
  }`;
  const prefixWidth = editor.getCheckboxPrefixWidth();
  const marginLeft = prefixWidth - CHECKBOX_SIZE - MARGIN_RIGHT;
  return {
    className: CHECKBOX_PREFIX_CLASSNAME,
    styleNode: (
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .${CHECKBOX_PREFIX_CLASSNAME}::before {
          color: #444;
          line-height: 12px;
          display: inline-block;
          box-sizing: border-box;
          width: ${CHECKBOX_SIZE}px;
          height: ${CHECKBOX_SIZE}px;
          border: 1px solid #CCC;
          border-radius: 5px;
          margin: ${MARGIN_TOP}px ${MARGIN_RIGHT}px 0 ${marginLeft}px;
          content: '${isChecked ? '✓' : ''}';
          text-align: center;
          cursor: pointer;
        }
      `,
        }}
      />
    ),
  };
}

export function eventOffsetOnCheckbox(
  editor: Object,
  offsetX: number,
  offsetY: number,
): boolean {
  if (!checkboxPrefixEnabled(editor)) {
    return false;
  }
  const prefixWidth = editor.getCheckboxPrefixWidth();
  const marginLeft = prefixWidth - CHECKBOX_SIZE - MARGIN_RIGHT;
  return (
    offsetX >= marginLeft &&
    offsetX <= marginLeft + CHECKBOX_SIZE &&
    offsetY >= MARGIN_TOP &&
    offsetY <= MARGIN_TOP + CHECKBOX_SIZE
  );
}

export function hasCheckboxPrefix(editor: Object, node: Object): boolean {
  if (!checkboxPrefixEnabled(editor)) {
    return false;
  }

  return node.data.get(CHECKBOX_PREFIX_DATA_KEY) != null; // false = unchecked
}

export function isCheckboxPrefixChecked(editor: Object, node: Object): boolean {
  if (!checkboxPrefixEnabled(editor)) {
    return false;
  }

  return node.data.get(CHECKBOX_PREFIX_DATA_KEY);
}

export function prefixWithCheckboxByPath(
  editor: Object,
  path: Object,
  checked: ?boolean, // null = toggle
): void {
  if (!checkboxPrefixEnabled(editor)) {
    return;
  }
  const node = editor.value.document.getNode(path);
  const oldValue = node.data.get(CHECKBOX_PREFIX_DATA_KEY);
  const newValue = checked == null ? !oldValue : checked;
  if (oldValue === newValue) {
    return;
  }

  editor.setNodeByPath(path, {
    data: node.data.merge({[CHECKBOX_PREFIX_DATA_KEY]: newValue}),
  });
}

export function unprefixWithCheckboxByPath(editor: Object, path: Object): void {
  if (!checkboxPrefixEnabled(editor)) {
    return;
  }
  const node = editor.value.document.getNode(path);
  if (!hasCheckboxPrefix(editor, node)) {
    return;
  }

  editor.setNodeByPath(path, {
    data: node.data.merge({[CHECKBOX_PREFIX_DATA_KEY]: null}),
  });
}

export default function CheckboxPrefix({
  prefixWidth,
}: {
  prefixWidth: number,
}): Object {
  return {
    queries: {
      getCheckboxPrefixWidth(): number {
        return prefixWidth;
      },
    },
  };
}
