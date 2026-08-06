import { useCallback, useEffect, useRef, useState } from 'react';
import { formatClock, nowMinutes, parseClock } from '../data/time';

/**
 * Reloj de simulación que avanza en tiempo real (1s real ≈ 1s sim)
 * y permite fijar la hora manualmente.
 * Solo dispara re-render cuando cambia el minuto mostrado (o pause/set).
 */
export function useSimClock() {
  const [minutes, setMinutes] = useState(() => Math.floor(nowMinutes()));
  const [paused, setPaused] = useState(false);
  const lastWall = useRef(Date.now());
  const accRef = useRef(nowMinutes()); // precisión sub-minuto

  useEffect(() => {
    const id = window.setInterval(() => {
      const wall = Date.now();
      const dtSec = (wall - lastWall.current) / 1000;
      lastWall.current = wall;
      if (paused) return;

      accRef.current += dtSec / 60;
      if (accRef.current >= 24 * 60) accRef.current -= 24 * 60;
      const floored = Math.floor(accRef.current);
      setMinutes((m) => (m === floored ? m : floored));
    }, 1000);
    return () => window.clearInterval(id);
  }, [paused]);

  const setTime = useCallback((hhmm: string) => {
    const v = parseClock(hhmm);
    accRef.current = v;
    setMinutes(Math.floor(v));
    lastWall.current = Date.now();
  }, []);

  const setHoursMinutes = useCallback((h: number, m: number) => {
    const v = ((h * 60 + m) % (24 * 60) + 24 * 60) % (24 * 60);
    accRef.current = v;
    setMinutes(v);
    lastWall.current = Date.now();
  }, []);

  const jumpMinutes = useCallback((delta: number) => {
    let next = accRef.current + delta;
    while (next < 0) next += 24 * 60;
    while (next >= 24 * 60) next -= 24 * 60;
    accRef.current = next;
    setMinutes(Math.floor(next));
    lastWall.current = Date.now();
  }, []);

  const syncNow = useCallback(() => {
    const n = nowMinutes();
    accRef.current = n;
    setMinutes(Math.floor(n));
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
  };
}
