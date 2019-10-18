// @flow
// @format

import React from 'react';
import invariant from 'invariant';
import {List} from 'immutable';
import {Block, Point} from 'slate';
import Hotkeys from 'slate-hotkeys';

import {
  INDENTABLE_DEFAULT_DATA,
  INDENTABLE_DATA_SCHEMA,
  renderIndentableStyle,
  getIndentEvent,
  indentByPath,
} from './plugins/Indentable';

export const LINE_TYPE = 'line';
export const DEFAULT_LINE_NODE = {
  object: 'block',
  type: LINE_TYPE,
  data: {
    ...INDENTABLE_DEFAULT_DATA,
  },
  nodes: [
    {
      object: 'text',
      text: '',
    },
  ],
};

export default function Line() {
  return {
    schema: {
      blocks: {
        [LINE_TYPE]: {
          data: {
            ...INDENTABLE_DATA_SCHEMA,
          },
          nodes: [
            {
              match: {object: 'text'},
              min: 1,
              max: 1,
            },
          ],
        },
      },
    },
    renderBlock(props: Object, editor: Object, next: Function) {
      const {node, attributes, children} = props;

      if (node.type !== LINE_TYPE) {
        return next();
      }

      if (node.type === LINE_TYPE) {
        return (
          <div
            {...attributes}
            style={{
              display: 'flex',
              //marginLeft: indentWidth * node.data.get(INDENT_LEVEL_DATA_KEY),
              ...renderIndentableStyle(editor, node),
            }}>
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
      isPointAtStartOfLine(editor: Object, point: Point): boolean {
        return point.path.size === 2 && point.offset === 0;
      },
    },
    onKeyDown(event: Object, editor: Object, next: Function) {
      const getSelectedNodes = () => {
        const {start, end} = editor.value.selection;
        const startLinePath = editor.getLinePathFromDescendentPath(start.path);
        const endLinePath = editor.getLinePathFromDescendentPath(end.path);
        const totalCount = endLinePath.get(0) - startLinePath.get(0) + 1;
        const nodePaths = Array.from(Array(totalCount)).map((_, i) =>
          editor.getLinePathNthAway(startLinePath, i),
        );
        return {
          isSelectionStartAtStartOfFirstNode: editor.isPointAtStartOfLine(
            start,
          ),
          nodeKeysOrPaths: nodePaths,
        };
      };

      const indentEvent = getIndentEvent(editor, event, getSelectedNodes);
      if (indentEvent) {
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
  };
}
