import { useState, useEffect, useRef, useCallback } from 'react';

const useIdleTimer = (onIdle, idleTime = 20000) => {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setIsIdle(true);
      onIdle();
    }, idleTime);
  }, [clearTimer, onIdle, idleTime]);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    clearTimer();
  }, [clearTimer]);

  const restartTimer = useCallback(() => {
    resetTimer();
    startTimer();
  }, [resetTimer, startTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    isIdle,
    startTimer,
    resetTimer,
    restartTimer,
    clearTimer
  };
};

export default useIdleTimer;