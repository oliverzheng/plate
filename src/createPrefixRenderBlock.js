// @flow
// @format

import React from 'react';

export default function createPrefixRenderBlock(
  prefixType: string,
  indentWidth: number,
  renderPrefix: (editor: Object, node: Object) => React$Node,
): (props: Object, editor: Object, next: Function) => mixed {
  return (props: Object, editor: Object, next: Function) => {
    const {node, attributes, children} = props;
    if (node.type !== prefixType) {
      return next();
    }
    const prefixPath = editor.value.document.getPath(node.key);
    const refocusCursor = event => {
      const frontOfText = editor.getFrontOfLineTextPath(prefixPath);
      editor
        .moveAnchorTo(frontOfText, 0)
        .moveFocusTo(frontOfText, 0)
        .focus();
      event.preventDefault();
    };

    return (
      <div
        {...attributes}
        onMouseDown={(event, next) => {
          refocusCursor(event);
        }}
        style={{
          width: indentWidth,
          float: 'left',
        }}>
        {renderPrefix(editor, node)}
        {children}
      </div>
    );
  };
}
