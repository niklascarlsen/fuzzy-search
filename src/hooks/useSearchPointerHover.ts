import {useCallback, useEffect, useState} from 'react';

const MOVE_THRESHOLD = 2;

function supportsDesktopHover() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches;
}

// Prevents hover and focus states from existing simultaneously.
// For example, if a mouse pointer rests at the exact coordinates where a modal opens,
// this prevents the element under the cursor from triggering an immediate hover/focus state.
// Gates pointer-hover highlighting until actual mouse movement exceeds a defined threshold.
// Also prevents spurious hover events during keyboard navigation (e.g., scrollIntoView).
export function useSearchPointerHover(resetKey: string) {
  const canUsePointerHover = supportsDesktopHover();
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const [hoverAllowed, setHoverAllowed] = useState(false);

  // Resets the hover gate when the key changes.
  // Synchronized during render to avoid unnecessary effect cycles.
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setHoverAllowed(false);
  }

  useEffect(() => {
    if (!canUsePointerHover || hoverAllowed) return;

    const onPointerMove = (e: PointerEvent) => {
      if (Math.abs(e.movementX) + Math.abs(e.movementY) < MOVE_THRESHOLD) {
        return;
      }
      setHoverAllowed(true);
    };

    document.addEventListener('pointermove', onPointerMove, {passive: true});
    return () => document.removeEventListener('pointermove', onPointerMove);
  }, [canUsePointerHover, hoverAllowed]);

  // Invoked from keyboard handlers to require new pointer movement before hover is re-enabled.
  const lockHover = useCallback(() => setHoverAllowed(false), []);

  return {hoverAllowed, lockHover};
}
