import { useCallback, useEffect, useRef, useState } from 'react';
import { formatClock, nowMinutes, parseClock } from '../data/time';

/**
 * Reloj de simulación que avanza en tiempo real (1s real ≈ 1s sim)
 * y permite fijar la hora manualmente.
 */
export function useSimClock() {
  const [minutes, setMinutes] = useState(() => nowMinutes());
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0); // fuerza re-render cada segundo
  const lastWall = useRef(Date.now());
  const minutesRef = useRef(minutes);
  minutesRef.current = minutes;

  useEffect(() => {
    const id = window.setInterval(() => {
      const wall = Date.now();
      const dtSec = (wall - lastWall.current) / 1000;
      lastWall.current = wall;
      if (!paused) {
        setMinutes((m) => {
          const next = m + dtSec / 60;
          return next >= 24 * 60 ? next - 24 * 60 : next;
        });
      }
      setTick((t) => t + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [paused]);

  const setTime = useCallback((hhmm: string) => {
    setMinutes(parseClock(hhmm));
    lastWall.current = Date.now();
  }, []);

  const setHoursMinutes = useCallback((h: number, m: number) => {
    setMinutes(((h * 60 + m) % (24 * 60) + 24 * 60) % (24 * 60));
    lastWall.current = Date.now();
  }, []);

  const jumpMinutes = useCallback((delta: number) => {
    setMinutes((m) => {
      let next = m + delta;
      while (next < 0) next += 24 * 60;
      while (next >= 24 * 60) next -= 24 * 60;
      return next;
    });
    lastWall.current = Date.now();
  }, []);

  const syncNow = useCallback(() => {
    setMinutes(nowMinutes());
    lastWall.current = Date.now();
  }, []);

  const togglePause = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  return {
    minutes,
    clock: formatClock(minutes),
    paused,
    setPaused,
    togglePause,
    setTime,
    setHoursMinutes,
    jumpMinutes,
    syncNow,
    tick,
  };
}
