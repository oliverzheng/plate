// @flow
// @format

import React from 'react';
import nullthrows from 'nullthrows';
import invariant from 'invariant';
import {Point} from 'slate';
import Hotkeys from 'slate-hotkeys';

const INDENT_LEVEL_DATA_KEY = 'indentLevel';

export const INDENTABLE_DEFAULT_DATA = {
  [INDENT_LEVEL_DATA_KEY]: 0,
};

export function indentEnabled(editor: Object): boolean {
  return editor.hasQuery('getIndentWidthInEm');
}

export function renderIndentableStyle(editor: Object, node: Object): ?Object {
  if (!indentEnabled(editor)) {
    return null;
  }

  const indentLevel = editor.getIndentableLevel(node.key);
  if (indentLevel == null) {
    return null;
  }
  return {
    display: 'flex',
    marginLeft: `${indentLevel * editor.getIndentWidthInEm()}em`,
  };
}

export function canIndent(editor: Object, path: Object): boolean {
  if (!indentEnabled(editor)) {
    return false;
  }

  const indentLevel = editor.getIndentableLevel(path);
  return indentLevel < editor.getMaxIndentLevels();
}

export function canUnindent(editor: Object, path: Object): boolean {
  if (!indentEnabled(editor)) {
    return false;
  }

  const indentLevel = editor.getIndentableLevel(path);
  return indentLevel > 0;
}

type IndentAction = 'indent' | 'unindent' | 'resetIndentation';

export function indentByPath(
  editor: Object,
  path: Object,
  indentAction: IndentAction,
): void {
  if (!indentEnabled(editor)) {
    return;
  }

  const line = editor.value.document.getNode(path);
  const currentIndentLevel = line.data.get(INDENT_LEVEL_DATA_KEY);
  invariant(typeof currentIndentLevel === 'number', 'Line must be indentable');

  const maxIndentLevels = editor.getMaxIndentLevels();
  const newIndentLevel = ({
    indent: Math.min(currentIndentLevel + 1, maxIndentLevels),
    unindent: Math.max(currentIndentLevel - 1, 0),
    resetIndentation: 0,
  }: {[IndentAction]: number})[indentAction];
  editor.setNodeByPath(path, {
    data: line.data.merge({[INDENT_LEVEL_DATA_KEY]: newIndentLevel}),
  });
}

type IndentEvent = {
  action: IndentAction,
  actionable: boolean,
};

export function getIndentEvent(
  editor: Object,
  event: Object,
  getSelectedNodes: () => {
    isSelectionStartAtStartOfFirstNode: boolean,
    nodeKeysOrPaths: Array<Object>,
  },
): ?IndentEvent {
  if (!indentEnabled(editor)) {
    return null;
  }

  const isTab =
    event.key === 'Tab' && !event.ctrlKey && !event.metaKey && !event.altKey;
  if (isTab) {
    const canCheck = event.shiftKey ? canUnindent : canIndent;
    return {
      action: event.shiftKey ? 'unindent' : 'indent',
      actionable: getSelectedNodes().nodeKeysOrPaths.some(keyOrPath =>
        canCheck(editor, keyOrPath),
      ),
    };
  }

  const {selection} = editor.value;
  if (
    selection.isCollapsed &&
    (Hotkeys.isDeleteBackward(event) ||
      Hotkeys.isDeleteLineBackward(event) ||
      Hotkeys.isDeleteWordBackward(event))
  ) {
    const {
      isSelectionStartAtStartOfFirstNode,
      nodeKeysOrPaths,
    } = getSelectedNodes();
    if (
      isSelectionStartAtStartOfFirstNode &&
      canUnindent(editor, nullthrows(nodeKeysOrPaths[0]))
    ) {
      return {
        action: Hotkeys.isDeleteLineBackward(event)
          ? 'resetIndentation'
          : 'unindent',
        actionable: true,
      };
    }
  }

  return null;
}

export default function Indentable({
  indentWidthInEm,
  maxIndentLevels,
}: {
  indentWidthInEm: number,
  maxIndentLevels: number,
}): Object {
  return {
    queries: {
      getMaxIndentLevels(): number {
        return maxIndentLevels;
      },
      getIndentWidthInEm(): number {
        return indentWidthInEm;
      },
      getIndentableLevel(editor: Object, path: Object): ?number {
        const node = editor.value.document.getNode(path);
        invariant(node, 'Node must not be null');
        return node.data && node.data.get(INDENT_LEVEL_DATA_KEY);
      },
      isIndentable(editor: Object, path: Object) {
        return editor.getIndentableLevel(path) != null;
      },
    },
  };
}
