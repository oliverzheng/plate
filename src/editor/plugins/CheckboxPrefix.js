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
const CHECKBOX_SIZE_IN_EM = 0.9375;
const MARGIN_RIGHT_IN_EM = 0.25;
const MARGIN_TOP_IN_EM = 0.25;
const BORDER_RADIUS_IN_EM = 0.3125;
const BORDER_IN_EM = 0.0625;

export function checkboxPrefixEnabled(editor: Object): boolean {
  return editor.hasQuery('getCheckboxPrefixWidthInEm');
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
  const prefixWidthInEm = editor.getCheckboxPrefixWidthInEm();
  return {
    className: CHECKBOX_PREFIX_CLASSNAME,
    styleNode: (
      <style
        dangerouslySetInnerHTML={{
          __html: `
        ${
          isChecked
            ? ` .${CHECKBOX_PREFIX_CLASSNAME} > span {
              color: #999;
              text-decoration-line: line-through;
            }
          `
            : ''
        }
        .${CHECKBOX_PREFIX_CLASSNAME}::before {
          flex-shrink: 0;
          color: #FFF;
          font-weight: bold;
          line-height: 0.8em;
          display: inline-block;
          box-sizing: border-box;
          width: ${CHECKBOX_SIZE_IN_EM}em;
          height: ${CHECKBOX_SIZE_IN_EM}em;
          border: ${BORDER_IN_EM}em solid #BBB;
          ${isChecked ? 'background: #BBB;' : ''}
          border-radius: ${BORDER_RADIUS_IN_EM}em;
          margin-right: ${MARGIN_RIGHT_IN_EM}em;
          margin-top: ${MARGIN_TOP_IN_EM}em;
          margin-left: ${prefixWidthInEm -
            CHECKBOX_SIZE_IN_EM -
            MARGIN_RIGHT_IN_EM}em;
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
  const prefixWidthInEm = editor.getCheckboxPrefixWidthInEm();
  const marginLeftInEm =
    prefixWidthInEm - CHECKBOX_SIZE_IN_EM - MARGIN_RIGHT_IN_EM;
  const fontSizeInPx = editor.getCheckboxFontSizeInPx();
  return (
    offsetX >= marginLeftInEm * fontSizeInPx &&
    offsetX <= (marginLeftInEm + CHECKBOX_SIZE_IN_EM) * fontSizeInPx &&
    offsetY >= MARGIN_TOP_IN_EM * fontSizeInPx &&
    offsetY <= (MARGIN_TOP_IN_EM + CHECKBOX_SIZE_IN_EM) * fontSizeInPx
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
  prefixWidthInEm,
  fontSizeInPx,
}: {
  prefixWidthInEm: number,
  fontSizeInPx: number,
}): Object {
  invariant(
    prefixWidthInEm >= CHECKBOX_SIZE_IN_EM + MARGIN_RIGHT_IN_EM,
    'prefix width must be bigger than checkbox width + margin-right',
  );
  return {
    queries: {
      getCheckboxPrefixWidthInEm(): number {
        return prefixWidthInEm;
      },
      getCheckboxFontSizeInPx(): number {
        return fontSizeInPx;
      },
    },
  };
}
