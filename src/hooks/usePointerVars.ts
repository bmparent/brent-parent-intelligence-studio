import { RefObject, useEffect } from 'react';

export function usePointerVars<T extends HTMLElement>(ref: RefObject<T | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      root.style.setProperty('--pointer-x', `${x.toFixed(2)}%`);
      root.style.setProperty('--pointer-y', `${y.toFixed(2)}%`);
      root.style.setProperty('--mx', `${x.toFixed(2)}%`);
      root.style.setProperty('--my', `${y.toFixed(2)}%`);
      root.style.setProperty('--tilt-x', `${((y - 50) / -18).toFixed(3)}deg`);
      root.style.setProperty('--tilt-y', `${((x - 50) / 18).toFixed(3)}deg`);
      root.style.setProperty('--rx', `${((y - 50) / -30).toFixed(3)}deg`);
      root.style.setProperty('--ry', `${((x - 50) / 30).toFixed(3)}deg`);
    };

    root.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => root.removeEventListener('pointermove', handlePointerMove);
  }, [ref]);
}
