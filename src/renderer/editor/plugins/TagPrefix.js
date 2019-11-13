// @flow
// @format

import React from 'react';

const TAG_PREFIX_DATA_KEY = 'tagPrefix';
export const TAG_PREFIX_DEFAULT_DATA = {
  [TAG_PREFIX_DATA_KEY]: null,
};
const MARGIN_RIGHT_IN_EM = 0.25;
const BORDER_RADIUS_IN_EM = 0.3125;
const HORIZONTAL_PADDING_IN_EM = 0.1;
const PREFIX_REGEX = /^\[(\w+)\] /;
const HEIGHT_IN_EM = 0.9375;

export function tagPrefixEnabled(editor: Object): boolean {
  return editor.hasQuery('getTagPrefixWidthInEm');
}

export function getTagPrefix(editor: Object, node: Object): ?string {
  if (!tagPrefixEnabled(editor)) {
    return null;
  }

  return node.data.get(TAG_PREFIX_DATA_KEY);
}

type TextTagPrefix = {
  length: number,
  tag: string,
};

export function getTextTagPrefix(editor: Object, text: string): ?TextTagPrefix {
  if (!tagPrefixEnabled(editor)) {
    return null;
  }

  const match = text.match(PREFIX_REGEX);
  if (!match) {
    return null;
  }

  return {
    length: match[0].length,
    tag: match[1].substr(0, 4),
  };
}

type TagPrefixRender = {
  className: string,
  styleNode: React$Node,
};

export function renderTagPrefix(
  editor: Object,
  node: Object,
): ?TagPrefixRender {
  if (!tagPrefixEnabled(editor)) {
    return null;
  }
  const tag = getTagPrefix(editor, node);
  if (tag == null) {
    return null;
  }

  const TAG_PREFIX_CLASSNAME = `tag-prefix-node-${tag}`;
  const widthInEm = editor.getTagPrefixWidthInEm();
  const fontScale = 0.65;
  return {
    className: TAG_PREFIX_CLASSNAME,
    styleNode: (
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .${TAG_PREFIX_CLASSNAME}::before {
          font-weight: bold;
          box-sizing: border-box;
          flex-shrink: 0;
          display: inline-block;
          width: ${(widthInEm - MARGIN_RIGHT_IN_EM) / fontScale}em;
          height: ${HEIGHT_IN_EM / fontScale + 0.1 /* fix this */}em;
          line-height: ${1 / fontScale}em;
          margin-top: ${0.2 / fontScale}em; /*make this a param*/
          text-transform: uppercase;
          margin-right: ${MARGIN_RIGHT_IN_EM / fontScale}em;
          content: '${tag}';
          font-family: "Lucida Console", monospace;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          padding: 0 ${HORIZONTAL_PADDING_IN_EM / fontScale}em;
          border-radius: ${BORDER_RADIUS_IN_EM / fontScale}em;
          background: #DDD;
          color: #555;
          font-size: ${fontScale}em;
        }
      `,
        }}
      />
    ),
  };
}

export function prefixWithTagByPath(
  editor: Object,
  path: Object,
  tag: string,
): void {
  if (!tagPrefixEnabled(editor)) {
    return;
  }
  const node = editor.value.document.getNode(path);
  editor.setNodeByPath(path, {
    data: node.data.merge({[TAG_PREFIX_DATA_KEY]: tag}),
  });
}

export function unprefixWithTagByPath(editor: Object, path: Object): void {
  if (!tagPrefixEnabled(editor)) {
    return;
  }
  const node = editor.value.document.getNode(path);
  if (getTagPrefix(editor, node) == null) {
    return;
  }

  editor.setNodeByPath(path, {
    data: node.data.merge({[TAG_PREFIX_DATA_KEY]: null}),
  });
}

export default function TagPrefix({
  prefixWidthInEm,
}: {
  prefixWidthInEm: number,
}): Object {
  return {
    queries: {
      getTagPrefixWidthInEm(): number {
        return prefixWidthInEm;
      },
    },
  };
}
