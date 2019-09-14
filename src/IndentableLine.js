// @flow
// @format

import React from 'react';
import invariant from 'invariant';
import Hotkeys from 'slate-hotkeys';

export const LINE_TYPE = 'indentableLine';
const INDENT_LEVEL_DATA_KEY = 'indentLevel';
const LINE_TEXT_TYPE = 'indentableLineText';
export const DEFAULT_LINE_NODE = {
  object: 'block',
  type: LINE_TYPE,
  data: {
    [INDENT_LEVEL_DATA_KEY]: 0,
  },
  nodes: [
    {
      object: 'block',
      type: LINE_TEXT_TYPE,
      nodes: [
        {
          object: 'text',
          text: '',
        },
      ],
    },
  ],
};

export default function IndentableLine(
  maxIndentLevel: number,
  indentWidth: number,
  prefixTypes: Array<string>,
) {
  return {
    schema: {
      blocks: {
        [LINE_TYPE]: {
          data: {
            [INDENT_LEVEL_DATA_KEY]: (l: any) =>
              typeof l === 'number' && l >= 0,
          },
          nodes: [
            {
              // https://github.com/facebook/flow/issues/6151. This flowtype seems dumb.
              match: prefixTypes.map<{type: string}>(type => ({type})),
              min: 0,
              max: 1,
            },
            {
              match: {type: LINE_TEXT_TYPE},
              min: 1,
              max: 1,
            },
          ],
          normalize: (editor: Object, error: Object) => {
            if (error.code === 'child_max_invalid') {
              // This happens when the user presses enter in the middle of the
              // text. By default, a new LINE_TEXT block is created, but we only
              // allow 1. So we need to wrap the new LINE_TEXT in a LINE and
              // insert it to the root.
              const lineNode = error.node;
              // Get the 2nd LINE_TEXT
              let descendantIndex = 0;
              const splitLineText = lineNode.findDescendant(
                n => n.type === LINE_TEXT_TYPE && descendantIndex++ === 1,
              );
              const splitLineTextPath = editor.value.document.getPath(
                splitLineText,
              );
              editor.wrapBlockByKey(splitLineText.key, {
                type: LINE_TYPE,
                data: {
                  [INDENT_LEVEL_DATA_KEY]: lineNode.data.get(
                    INDENT_LEVEL_DATA_KEY,
                  ),
                },
              });
              editor.moveNodeByPath(
                splitLineTextPath,
                splitLineTextPath.setSize(0), // === List()
                splitLineTextPath.get(0) + 1,
              );
            }
          },
        },
        [LINE_TEXT_TYPE]: {
          nodes: [{match: {object: 'text'}, min: 1, max: 1}],
        },
      },
    },
    renderBlock(props: Object, editor: Object, next: Function) {
      const {node, attributes, children} = props;

      if (node.type !== LINE_TYPE && node.type !== LINE_TEXT_TYPE) {
        return next();
      }

      if (node.type === LINE_TYPE) {
        return (
          <div
            {...attributes}
            style={{
              marginLeft: indentWidth * node.data.get(INDENT_LEVEL_DATA_KEY),
            }}>
            {children}
          </div>
        );
      } else {
        return <div {...attributes}>{children}</div>;
      }
    },
    queries: {
      getLine(editor: Object, path: Object) {
        let node = editor.value.document.getNode(path);
        if (node.type !== LINE_TYPE) {
          node = editor.value.document.getClosest(
            path,
            n => n.type === LINE_TYPE,
          );
        }
        return node;
      },
      canIndentLine(editor: Object, path: Object) {
        const line = editor.getLine(path);
        invariant(line != null, 'Line cannot be null');
        return line.data.get(INDENT_LEVEL_DATA_KEY) < maxIndentLevel;
      },
      canDeindentLine(editor: Object, path: Object) {
        const line = editor.getLine(path);
        invariant(line != null, 'Line cannot be null');
        return line.data.get(INDENT_LEVEL_DATA_KEY) > 0;
      },
      getFrontOfLineTextPath(editor: Object, path: Object) {
        // path has to be within the line
        return path.set(1, 1).set(2, 0);
      },
    },
    commands: {
      setLineIndentLevelByPath(
        editor: Object,
        path: Object,
        newIndentLevel: number,
      ) {
        invariant(
          newIndentLevel >= 0 && newIndentLevel <= maxIndentLevel,
          `Indent level must > 0 and <= maxIndentLevel(${maxIndentLevel})`,
        );

        const line = editor.getLine(path);
        invariant(line != null, 'Line cannot be null');

        editor.setNodeByPath(path, {
          data: line.data.merge({[INDENT_LEVEL_DATA_KEY]: newIndentLevel}),
        });
      },
    },
    onKeyDown(event: Object, editor: Object, next: Function) {
      const {value} = editor;
      const {selection} = value;

      if (
        !(
          event.key === 'Tab' &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) &&
        !(
          (Hotkeys.isDeleteBackward(event) ||
            Hotkeys.isDeleteLineBackward(event) ||
            Hotkeys.isDeleteWordBackward(event) ||
            Hotkeys.isSplitBlock(event)) &&
          selection.start.offset === 0
        )
      ) {
        return next();
      }

      const lineNode = editor.getLine(selection.start.path);
      const linePath = editor.value.document.getPath(lineNode.key);
      const indentLevel = lineNode.data.get(INDENT_LEVEL_DATA_KEY);

      if (event.key === 'Tab') {
        event.preventDefault();

        if (!event.shiftKey && editor.canIndentLine(linePath)) {
          editor.setLineIndentLevelByPath(linePath, indentLevel + 1);
        } else if (event.shiftKey && editor.canDeindentLine(linePath)) {
          editor.setLineIndentLevelByPath(linePath, indentLevel - 1);
        }
        return next();
      } else {
        // Backspace
        // The editor already calls preventDefault

        if (editor.canDeindentLine(linePath)) {
          if (Hotkeys.isDeleteLineBackward(event)) {
            editor.setLineIndentLevelByPath(linePath, 0);
          } else {
            editor.setLineIndentLevelByPath(linePath, indentLevel - 1);
          }
          // Do not call next() for this, as the editor will backspace into the
          // previous block.
        } else {
          return next();
        }
      }
    },
    // Never let the focus go to the prefix element
    onChange(editor: Object, next: Function) {
      const {document, selection} = editor.value;
      const {anchor, focus} = selection;
      if (
        anchor.path &&
        document.getParent(anchor.path.setSize(2)).nodes.size >= 2 &&
        anchor.path.get(1) === 0
      ) {
        editor.moveAnchorTo(editor.getFrontOfLineTextPath(anchor.path), 0);
      }
      if (
        focus.path &&
        document.getParent(focus.path.setSize(2)).nodes.size >= 2 &&
        focus.path.get(1) === 0
      ) {
        editor.moveFocusTo(editor.getFrontOfLineTextPath(focus.path), 0);
      }
      return next();
    },
  };
}
