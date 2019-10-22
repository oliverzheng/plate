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
  const CHECKBOX_SIZE = 15;
  const prefixWidth = editor.getCheckboxPrefixWidth();
  const marginRight = 4;
  const marginLeft = prefixWidth - CHECKBOX_SIZE - marginRight;
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
          margin: 2px ${marginRight}px 0 ${marginLeft}px;
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
  checked: boolean,
): void {
  if (!checkboxPrefixEnabled(editor)) {
    return;
  }
  const node = editor.value.document.getNode(path);
  if (hasCheckboxPrefix(editor, node)) {
    return;
  }

  editor.setNodeByPath(path, {
    data: node.data.merge({[CHECKBOX_PREFIX_DATA_KEY]: checked}),
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
