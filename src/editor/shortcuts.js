// @flow
// @format

import Hotkeys from 'slate-hotkeys';
import {isKeyHotkey} from 'is-hotkey';

export function moveLineUp() {
  const isMetaCtrlUp = isKeyHotkey('meta+ctrl+up');
  const isMetaCtrlDown = isKeyHotkey('meta+ctrl+down');

  return {
    onKeyDown(event: Object, editor: Object, next: Function) {
      const isUp = isMetaCtrlUp(event);
      const isDown = isMetaCtrlDown(event);
      if (isUp || isDown) {
        const {value} = editor;
        const {selection} = value;
        const startLinePath = selection.start.path.setSize(1);
        const endLinePath = selection.end.path.setSize(1);
        editor.moveLinesByPath(startLinePath, endLinePath, isUp ? -1 : 1);
      } else {
        return next();
      }
    },
  };
}
