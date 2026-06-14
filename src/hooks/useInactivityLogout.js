import { useEffect, useRef } from 'react';

const INACTIVITY_MS = 30 * 60 * 1000;

export default function useInactivityLogout(logout) {
  const timerRef = useRef(null);

  useEffect(() => {
    const reset = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logout, INACTIVITY_MS);
    };
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [logout]);
}
