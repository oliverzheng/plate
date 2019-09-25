// @flow
// @format

import {useCallback, useRef} from 'react';

export default function useDelayedCallback(
  timeoutInMs: number,
  callback: () => mixed,
): () => void {
  const timer = useRef(null);
  return useCallback(() => {
    const clearTimer = () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };

    clearTimer();
    timer.current = setTimeout(() => {
      clearTimer();
      callback();
    }, timeoutInMs);
  }, [timeoutInMs, callback]);
}
