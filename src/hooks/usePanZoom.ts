import { useCallback, useEffect, useRef, useState } from 'react';

interface PanZoomState {
  x: number;
  y: number;
  scale: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const MIN_SCALE = 0.18;
const MAX_SCALE = 3.5;

export function usePanZoom(initial?: Partial<PanZoomState>) {
  const [state, setState] = useState<PanZoomState>({
    x: initial?.x ?? 0,
    y: initial?.y ?? 0,
    scale: initial?.scale ?? 0.55,
  });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-station], [data-line-hit], button, a, input, select')) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setState((s) => ({ ...s, x: s.x + dx, y: s.y + dy }));
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;

    setState((s) => {
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s.scale * delta));
      const ratio = newScale / s.scale;
      return {
        scale: newScale,
        x: mx - (mx - s.x) * ratio,
        y: my - (my - s.y) * ratio,
      };
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const zoomBy = useCallback((factor: number) => {
    setState((s) => {
      const el = containerRef.current;
      const mx = el ? el.clientWidth / 2 : 0;
      const my = el ? el.clientHeight / 2 : 0;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s.scale * factor));
      const ratio = newScale / s.scale;
      return {
        scale: newScale,
        x: mx - (mx - s.x) * ratio,
        y: my - (my - s.y) * ratio,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState({ x: 20, y: 10, scale: 0.28 });
  }, []);

  const fitBounds = useCallback((bounds: Bounds, padding = 80) => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const bw = Math.max(80, bounds.maxX - bounds.minX);
    const bh = Math.max(80, bounds.maxY - bounds.minY);
    const scale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, Math.min((w - padding * 2) / bw, (h - padding * 2) / bh)),
    );
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    setState({
      scale,
      x: w / 2 - cx * scale,
      y: h / 2 - cy * scale,
    });
  }, []);

  const focusPoint = useCallback((x: number, y: number, scale = 1.15) => {
    const el = containerRef.current;
    if (!el) return;
    const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
    setState({
      scale: s,
      x: el.clientWidth / 2 - x * s,
      y: el.clientHeight / 2 - y * s,
    });
  }, []);

  return {
    state,
    containerRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    zoomBy,
    reset,
    fitBounds,
    focusPoint,
  };
}
