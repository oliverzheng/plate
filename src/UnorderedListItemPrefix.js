// @flow
// @format

import React from 'react';

import createPrefixRenderBlock from './createPrefixRenderBlock';

export const UNORDERED_LIST_ITEM_TYPE = 'uli';
export const unorderedListItemPrefixTextToData = (text: string) => {
  if (text.startsWith('- ') || text.startsWith('* ')) {
    return {
      truncatePrefixLength: 2,
      data: {},
    };
  } else {
    return null;
  }
};

export default function UnorderedListItemPrefix(indentWidth: number) {
  return {
    schema: {
      blocks: {
        [UNORDERED_LIST_ITEM_TYPE]: {
          isVoid: true,
        },
      },
    },
    renderBlock: createPrefixRenderBlock(
      UNORDERED_LIST_ITEM_TYPE,
      indentWidth,
      (editor, node) => (
        <span
          style={{display: 'inline-block', textAlign: 'center', width: '100%'}}>
          {'\u2022'}
        </span>
      ),
    ),
  };
}
