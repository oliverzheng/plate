// @flow
// @format

import {useCallback, useRef} from 'react';

export default function useDelayedCallback(
  timeoutInMs: number,
  callback: any => mixed,
): any => void {
  const timer = useRef(null);
  return useCallback(
    (...args) => {
      const clearTimer = () => {
        if (timer.current) {
          clearTimeout(timer.current);
          timer.current = null;
        }
      };

      clearTimer();
      timer.current = setTimeout(() => {
        clearTimer();
        callback(...args);
      }, timeoutInMs);
    },
    [timeoutInMs, callback],
  );
}
