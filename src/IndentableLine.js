// @flow
// @format

import React from 'react';

export default function IndentableLine(lineType: string, indentWidth: number) {
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
        !(event.key === 'Backspace' && selection.start.offset === 0)
      ) {
        return next();
      }
      const indentLevel = startBlock.data.get('indentLevel');
      let indentLevelDelta;
      if (event.key === 'Tab') {
        indentLevelDelta = event.shiftKey ? -1 : 1;
      } else if (event.key === 'Backspace') {
        indentLevelDelta = event.metaKey ? -indentLevel : -1;
      }
      const newIndentLevel = indentLevel + indentLevelDelta;
      if (newIndentLevel >= 0) {
        editor.setNodeByKey(startBlock.key, {
          data: startBlock.data.merge({
            indentLevel: newIndentLevel,
          }),
        });
      }
      event.preventDefault();
      return next();
    },
  };
}
