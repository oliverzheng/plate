// @flow
// @format

import React from 'react';
import invariant from 'invariant';
import {Block} from 'slate';
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
  prefixTypeToData: {
    [prefixType: string]: (
      prefixText: string,
    ) => ?{truncatePrefixLength: number, data: Object},
  },
) {
  const prefixTypes = Object.keys(prefixTypeToData);
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
              display: 'flex',
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
      moveLinesByPath(
        editor: Object,
        startLinePath: Object,
        endLinePath: Object,
        offset: number,
      ) {
        const startLine = editor.getLine(startLinePath);
        const endLine = editor.getLine(endLinePath);
        invariant(startLine != null, 'startLine cannot be null');
        invariant(endLine != null, 'endLine cannot be null');
        const doc = editor.value.document;

        const startIdx = startLinePath.get(0);
        const endIdx = endLinePath.get(0) + 1;
        invariant(
          endIdx > startIdx,
          `endIdx (${endIdx}) must be bigger than startIdx (${startIdx})`,
        );
        const totalLength = doc.nodes.size;
        const newStartIdx = startIdx + offset;
        const newEndIdx = endIdx + offset;
        if (newStartIdx < 0 || newEndIdx > totalLength) {
          return false;
        }
        if (offset === 0) {
          return true;
        }

        const documentPath = startLinePath.setSize(0);
        if (offset < 0) {
          for (let idx = startIdx; idx < endIdx; idx++) {
            editor.moveNodeByPath(
              startLinePath.set(0, idx),
              documentPath,
              idx + offset,
            );
          }
        } else {
          // Move nodes last-one-first if we are moving them further down
          for (let idx = endIdx - 1; idx >= startIdx; idx--) {
            editor.moveNodeByPath(
              startLinePath.set(0, idx),
              documentPath,
              idx + offset,
            );
          }
        }
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
    normalizeNode(node: Object, editor: Object, next: Function) {
      if (node.type !== LINE_TEXT_TYPE) {
        return next();
      }
      const {nodes} = node;
      const textNode = nodes.first();
      const nodeText = nodes.first().text;
      if (nodeText === '') {
        return next();
      }
      const lineNode = editor.value.document.getParent(node.key);
      const existingPrefixNode =
        lineNode.nodes.size === 2 ? lineNode.nodes.first() : null;
      // Eslint bug: https://github.com/eslint/eslint/issues/12117. Need to wait
      // for react-scripts/create-react-app to update a release upstream.
      // eslint-disable-next-line no-unused-vars
      for (const prefixType in prefixTypeToData) {
        if (existingPrefixNode && existingPrefixNode.type === prefixType) {
          continue;
        }
        const prefixMatch = prefixTypeToData[prefixType](nodeText);
        if (prefixMatch) {
          const {truncatePrefixLength, data} = prefixMatch;
          return () => {
            if (existingPrefixNode) {
              // We already have a prefix. Change it.
              editor.setNodeByKey(lineNode.nodes.first().key, {
                type: prefixType,
                data,
              });
            } else {
              editor.insertNodeByKey(
                lineNode.key,
                0,
                Block.create({
                  type: prefixType,
                  data,
                  nodes: [{object: 'text', text: ''}],
                }),
              );
            }
            editor.removeTextByKey(textNode.key, 0, truncatePrefixLength);
          };
        }
      }
      return next();
    },
  };
}
