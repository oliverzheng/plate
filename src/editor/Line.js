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
  canUnindent,
} from './plugins/Indentable';
import {
  BULLET_PREFIX_DEFAULT_DATA,
  renderBulletPrefix,
  hasBulletPrefix,
  getTextBulletPrefix,
  prefixWithBulletByPath,
  unprefixWithBulletByPath,
} from './plugins/BulletPrefix';
import {
  CHECKBOX_PREFIX_DEFAULT_DATA,
  renderCheckboxPrefix,
  hasCheckboxPrefix,
  getTextCheckboxPrefix,
  prefixWithCheckboxByPath,
  unprefixWithCheckboxByPath,
  eventOffsetOnCheckbox,
} from './plugins/CheckboxPrefix';

export const LINE_TYPE = 'line';
export const DEFAULT_LINE_NODE = {
  object: 'block',
  type: LINE_TYPE,
  data: {
    ...INDENTABLE_DEFAULT_DATA,
    ...BULLET_PREFIX_DEFAULT_DATA,
    ...CHECKBOX_PREFIX_DEFAULT_DATA,
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
        const nodePath = editor.value.document.getPath(node);
        const bulletPrefixRender = renderBulletPrefix(editor, node);
        const checkboxPrefixRender = renderCheckboxPrefix(editor, node);
        return (
          <div
            {...attributes}
            className={[
              bulletPrefixRender && bulletPrefixRender.className,
              checkboxPrefixRender && checkboxPrefixRender.className,
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              display: 'flex',
              ...renderIndentableStyle(editor, node),
            }}
            onClick={e => {
              if (editor.findDOMNode(nodePath) !== e.nativeEvent.srcElement) {
                return;
              }
              if (hasCheckboxPrefix(editor, node)) {
                if (
                  eventOffsetOnCheckbox(
                    editor,
                    e.nativeEvent.offsetX,
                    e.nativeEvent.offsetY,
                  )
                ) {
                  prefixWithCheckboxByPath(editor, nodePath, null /*toggle*/);
                  // Can't prevent Slate from changing focus. Its event handlers
                  // trigger first onmousedown
                }
              }
            }}>
            {bulletPrefixRender && bulletPrefixRender.styleNode}
            {checkboxPrefixRender && checkboxPrefixRender.styleNode}
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
          Hotkeys.isDeleteWordBackward(event))
      ) {
        if (hasBulletPrefix(editor, lineNode)) {
          unprefixWithBulletByPath(editor, startLinePath);
          return;
        } else if (hasCheckboxPrefix(editor, lineNode)) {
          unprefixWithCheckboxByPath(editor, startLinePath);
          return;
        } else if (canUnindent(editor, startLinePath)) {
          indentByPath(editor, startLinePath, 'unindent');
          return;
        }
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

      const linePath = editor.value.document.getPath(node);
      const removeAllPrefixes = () => {
        unprefixWithBulletByPath(editor, linePath);
        unprefixWithCheckboxByPath(editor, linePath);
      };

      const textNode = getLineTextNode(node);
      const nodeText = textNode.text;
      const textBulletPrefix = getTextBulletPrefix(editor, nodeText);
      const textCheckboxPrefix = getTextCheckboxPrefix(editor, nodeText);
      if (textBulletPrefix) {
        return () => {
          editor.removeTextByKey(textNode.key, 0, textBulletPrefix.length);
          removeAllPrefixes();
          prefixWithBulletByPath(editor, linePath);
        };
      } else if (textCheckboxPrefix) {
        return () => {
          editor.removeTextByKey(textNode.key, 0, textCheckboxPrefix.length);
          removeAllPrefixes();
          prefixWithCheckboxByPath(
            editor,
            linePath,
            textCheckboxPrefix.checked,
          );
        };
      }

      return next();
    },
  };
}
