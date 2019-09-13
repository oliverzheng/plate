// @flow
// @format

import React from 'react';
import invariant from 'invariant';
import Hotkeys from 'slate-hotkeys';

export default function IndentableLine(
  lineType: string,
  maxIndentLevel: number,
  indentWidth: number,
) {
  return {
    renderBlock(props: Object, editor: Object, next: Function) {
      const {node, attributes, children} = props;

      if (node.type !== lineType) {
        return next();
      }
      return (
        <div
          {...attributes}
          style={{marginLeft: indentWidth * node.data.get('indentLevel')}}>
          {children}
        </div>
      );
    },
    queries: {
      getLine(editor: Object, path: Object) {
        let node = editor.value.document.getNode(path);
        if (node.type !== lineType) {
          node = editor.value.document.getClosest(
            path,
            n => n.type === lineType,
          );
        }
        return node;
      },
      canIndentLine(editor: Object, path: Object) {
        const line = editor.getLine(path);
        invariant(line != null, 'Line cannot be null');
        return line.data.get('indentLevel') < maxIndentLevel;
      },
      canDeindentLine(editor: Object, path: Object) {
        const line = editor.getLine(path);
        invariant(line != null, 'Line cannot be null');
        return line.data.get('indentLevel') > 0;
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
          data: line.data.merge({indentLevel: newIndentLevel}),
        });
      },
    },
    onKeyDown(event: Object, editor: Object, next: Function) {
      const {value} = editor;
      const {selection, startBlock} = value;

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

      const linePath = value.document.getPath(startBlock.key);
      const indentLevel = startBlock.data.get('indentLevel');

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
  };
}
