// @flow
// @format

import React from 'react';
import nullthrows from 'nullthrows';
import invariant from 'invariant';
import {Block, Inline, Text} from 'slate';
import Hotkeys from 'slate-hotkeys';

const BULLET_PREFIX_DATA_KEY = 'bulletPrefix';
export const BULLET_PREFIX_DEFAULT_DATA = {
  [BULLET_PREFIX_DATA_KEY]: false,
};
const BULLET_TEXT = '\u2022';
const TEXT_PREFIXES = ['-', '*'];

export function bulletPrefixEnabled(editor: Object): boolean {
  return editor.hasQuery('getBulletPrefixWidthInEm');
}

type TextBulletPrefix = {
  length: number,
};

export function getTextBulletPrefix(
  editor: Object,
  text: string,
): ?TextBulletPrefix {
  if (!bulletPrefixEnabled(editor)) {
    return null;
  }

  if (text.startsWith('- ') || text.startsWith('* ')) {
    return {length: 2};
  }
  return null;
}

type BulletPrefixRender = {
  className: string,
  styleNode: React$Node,
};

export function renderBulletPrefix(
  editor: Object,
  node: Object,
): ?BulletPrefixRender {
  if (!bulletPrefixEnabled(editor)) {
    return null;
  }
  if (!hasBulletPrefix(editor, node)) {
    return null;
  }

  const BULLET_PREFIX_CLASSNAME = 'bullet-prefix-node';
  const widthInEm = editor.getBulletPrefixWidthInEm();
  return {
    className: BULLET_PREFIX_CLASSNAME,
    styleNode: (
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .${BULLET_PREFIX_CLASSNAME}::before {
          flex-shrink: 0;
          display: inline-block;
          width: ${widthInEm}em;
          content: '${BULLET_TEXT}';
          text-align: center;
        }
      `,
        }}
      />
    ),
  };
}

export function hasBulletPrefix(editor: Object, node: Object): boolean {
  if (!bulletPrefixEnabled(editor)) {
    return false;
  }

  return node.data.get(BULLET_PREFIX_DATA_KEY);
}

export function prefixWithBulletByPath(editor: Object, path: Object): void {
  if (!bulletPrefixEnabled(editor)) {
    return;
  }
  const node = editor.value.document.getNode(path);
  if (hasBulletPrefix(editor, node)) {
    return;
  }

  editor.setNodeByPath(path, {
    data: node.data.merge({[BULLET_PREFIX_DATA_KEY]: true}),
  });
}

export function unprefixWithBulletByPath(editor: Object, path: Object): void {
  if (!bulletPrefixEnabled(editor)) {
    return;
  }
  const node = editor.value.document.getNode(path);
  if (!hasBulletPrefix(editor, node)) {
    return;
  }

  editor.setNodeByPath(path, {
    data: node.data.merge({[BULLET_PREFIX_DATA_KEY]: false}),
  });
}

export default function BulletPrefix({
  prefixWidthInEm,
}: {
  prefixWidthInEm: number,
}): Object {
  return {
    queries: {
      getBulletPrefixWidthInEm(): number {
        return prefixWidthInEm;
      },
    },
  };
}
