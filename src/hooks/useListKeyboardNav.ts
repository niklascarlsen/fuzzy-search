import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

type ListKeyboardNavOptions = {
  enabled: boolean;
  onSelect: (index: number) => void;
  resetKey: string;
  onKeyboardNav?: () => void;
};

function isInteractiveTarget(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el instanceof HTMLButtonElement) return true;
  if (el instanceof HTMLAnchorElement && el.href) return true;
  return el.getAttribute('role') === 'button';
}

export function useListKeyboardNav(
  itemCount: number,
  {enabled, onSelect, resetKey, onKeyboardNav}: ListKeyboardNavOptions,
) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Mirror the latest selection so the Enter handler can read it without
  // re-registering the global keydown listener on every selection change.
  const selectedRef = useRef(selectedIndex);
  useLayoutEffect(() => {
    selectedRef.current = selectedIndex;
  }, [selectedIndex]);

  useLayoutEffect(() => {
    // Reset synchronously before paint so a previous highlight never flashes on a new result set.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional list highlight reset
    setSelectedIndex(-1);
  }, [resetKey, itemCount]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || itemCount === 0 || e.isComposing) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        onKeyboardNav?.();
        setSelectedIndex((i) => {
          if (i === -1) return 0;
          return i < itemCount - 1 ? i + 1 : i;
        });
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onKeyboardNav?.();
        setSelectedIndex((i) => (i > 0 ? i - 1 : -1));
        return;
      }

      if (e.key === 'Enter') {
        if (isInteractiveTarget(document.activeElement)) return;

        const current = selectedRef.current;
        // No highlighted row yet (user still in search field only) — do not pick item 0 or close.
        if (current < 0) return;

        e.preventDefault();
        onSelect(current);
      }
    },
    [enabled, itemCount, onSelect, onKeyboardNav],
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {selectedIndex, setSelectedIndex};
}
