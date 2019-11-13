// @flow
// @format

import React from 'react';

const BULLET_PREFIX_DATA_KEY = 'bulletPrefix';
export const BULLET_PREFIX_DEFAULT_DATA = {
  [BULLET_PREFIX_DATA_KEY]: false,
};
const WIDTH_IN_EM = 0.9375;
const MARGIN_RIGHT_IN_EM = 0.25;
const BULLET_TEXT = '\u2022';

export function bulletPrefixEnabled(editor: Object): boolean {
  return editor.hasQuery('getBulletPrefixWidthInEm');
}

export function hasBulletPrefix(editor: Object, node: Object): boolean {
  if (!bulletPrefixEnabled(editor)) {
    return false;
  }

  return node.data.get(BULLET_PREFIX_DATA_KEY);
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
          width: ${WIDTH_IN_EM}em;
          margin-right: ${MARGIN_RIGHT_IN_EM}em;
          margin-left: ${widthInEm - WIDTH_IN_EM - MARGIN_RIGHT_IN_EM}em;
          content: '${BULLET_TEXT}';
          text-align: center;
        }
      `,
        }}
      />
    ),
  };
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
