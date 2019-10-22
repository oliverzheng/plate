// @flow
// @format

import React from 'react';
import invariant from 'invariant';
import {List} from 'immutable';
import {Block, Point} from 'slate';
import Hotkeys from 'slate-hotkeys';

import {
  INDENTABLE_DEFAULT_DATA,
  renderIndentableStyle,
  getIndentEvent,
  indentByPath,
} from './plugins/Indentable';
import {
  BULLET_PREFIX_DEFAULT_DATA,
  renderBulletPrefix,
  hasBulletPrefix,
  getTextBulletPrefix,
  prefixWithBulletByPath,
  unprefixWithBulletByPath,
} from './plugins/BulletPrefix';

export const LINE_TYPE = 'line';
export const DEFAULT_LINE_NODE = {
  object: 'block',
  type: LINE_TYPE,
  data: {
    ...INDENTABLE_DEFAULT_DATA,
    ...BULLET_PREFIX_DEFAULT_DATA,
  },
  nodes: [
    {
      object: 'text',
      text: '',
    },
  ],
};

function getLineTextNode(lineNode: Object): Object {
  return lineNode.nodes.get(-1);
}

function isPointAtStartOfLine(point: Object, lineNode: Object): boolean {
  const textNode = getLineTextNode(lineNode);
  return point.key === textNode.key && point.offset === 0;
}

function getLinePathFromSubPath(subPath: Object): Object {
  return subPath.setSize(1);
}

export default function Line() {
  return {
    renderBlock(props: Object, editor: Object, next: Function) {
      const {node, attributes, children} = props;

      if (node.type !== LINE_TYPE) {
        return next();
      }

      if (node.type === LINE_TYPE) {
        const bulletPrefixRender = renderBulletPrefix(editor, node);
        return (
          <div
            {...attributes}
            className={bulletPrefixRender && bulletPrefixRender.className}
            style={{
              display: 'flex',
              ...renderIndentableStyle(editor, node),
            }}>
            {bulletPrefixRender && bulletPrefixRender.styleNode}
            {children}
          </div>
        );
      }
    },
    queries: {
      getLinePathFromDescendentPath(
        editor: Object,
        descendentPath: Object,
      ): Object {
        return descendentPath.setSize(1);
      },
      getLinePathNthAway(
        editor: Object,
        startingLinePath: Object,
        nth: number,
      ): Object {
        return List([startingLinePath.get(0) + nth]);
      },
    },
    onKeyDown(event: Object, editor: Object, next: Function) {
      const {selection} = editor.value;
      const {start, end} = selection;
      const startLinePath = getLinePathFromSubPath(start.path);
      const lineNode = editor.value.document.getNode(startLinePath);

      const getSelectedNodes = () => {
        const startLinePath = editor.getLinePathFromDescendentPath(start.path);
        const endLinePath = editor.getLinePathFromDescendentPath(end.path);
        const totalCount = endLinePath.get(0) - startLinePath.get(0) + 1;
        const nodePaths = Array.from(Array(totalCount)).map((_, i) =>
          editor.getLinePathNthAway(startLinePath, i),
        );
        return {
          isSelectionStartAtStartOfFirstNode: isPointAtStartOfLine(
            start,
            lineNode,
          ),
          nodeKeysOrPaths: nodePaths,
        };
      };

      const indentEvent = getIndentEvent(editor, event, getSelectedNodes);
      if (
        selection.isCollapsed &&
        isPointAtStartOfLine(start, lineNode) &&
        (Hotkeys.isDeleteBackward(event) ||
          Hotkeys.isDeleteLineBackward(event) ||
          Hotkeys.isDeleteWordBackward(event)) &&
        hasBulletPrefix(editor, lineNode)
      ) {
        unprefixWithBulletByPath(editor, startLinePath);
        return;
      } else if (indentEvent) {
        event.preventDefault();
        if (indentEvent.actionable) {
          getSelectedNodes().nodeKeysOrPaths.forEach(path =>
            indentByPath(editor, path, indentEvent.action),
          );
        }
        return;
      }

      return next();
    },
    normalizeNode(node: Object, editor: Object, next: Function) {
      if (node.type !== LINE_TYPE) {
        return next();
      }

      const textNode = getLineTextNode(node);
      const nodeText = textNode.text;
      const textBulletPrefix = getTextBulletPrefix(editor, nodeText);
      if (textBulletPrefix) {
        const linePath = editor.value.document.getPath(node);
        return () => {
          editor.removeTextByKey(textNode.key, 0, textBulletPrefix.length);
          prefixWithBulletByPath(editor, linePath);
        };
      }

      return next();
    },
  };
}
