// @flow
// @format

import React from 'react';

import createPrefixRenderBlock from './createPrefixRenderBlock';

export const CHECKBOX_ITEM_TYPE = 'checkbox';
const uncheckedPrefixTexts = ['[]', '[ ]'];
const checkedPrefixTexts = ['[x]', '[X]'];
export const checkboxPrefixTextToData = (text: string) => {
  // Eslint bug: https://github.com/eslint/eslint/issues/12117. Need to wait
  // eslint-disable-next-line no-unused-vars
  for (const prefix of uncheckedPrefixTexts) {
    if (text.startsWith(prefix + ' ')) {
      return {
        truncatePrefixLength: prefix.length + 1,
        data: {
          checked: false,
        },
      };
    }
  }
  // eslint-disable-next-line no-unused-vars
  for (const prefix of checkedPrefixTexts) {
    if (text.startsWith(prefix + ' ')) {
      return {
        truncatePrefixLength: prefix.length + 1,
        data: {
          checked: true,
        },
      };
    }
  }
  return null;
};

export default function CheckboxPrefix(indentWidth: number) {
  return {
    schema: {
      blocks: {
        [CHECKBOX_ITEM_TYPE]: {
          isVoid: true,
        },
      },
    },
    renderBlock: createPrefixRenderBlock(
      CHECKBOX_ITEM_TYPE,
      indentWidth,
      (editor, node) => (
        <span
          style={{display: 'inline-block', textAlign: 'center', width: '100%'}}>
          <input
            type="checkbox"
            checked={node.data.get('checked')}
            onChange={event => {
              editor.setNodeByKey(node.key, {
                data: {
                  checked: event.target.checked,
                },
              });
            }}
          />
        </span>
      ),
    ),
  };
}
