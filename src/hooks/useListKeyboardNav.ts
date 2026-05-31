import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

type ListKeyboardNavOptions = {
  enabled: boolean;
  onSelect: (index: number) => void;
  resetKey: string;
  onKeyboardNav?: () => void;
  onActiveOptionChange?: (index: number) => void;
};

function isInteractiveTarget(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el instanceof HTMLButtonElement) return true;
  if (el instanceof HTMLAnchorElement && el.href) return true;
  return el.getAttribute('role') === 'button';
}

export function useListKeyboardNav(
  itemCount: number,
  {
    enabled,
    onSelect,
    resetKey,
    onKeyboardNav,
    onActiveOptionChange,
  }: ListKeyboardNavOptions,
) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const selectedRef = useRef(selectedIndex); // stable Enter handler without re-subscribing
  useLayoutEffect(() => {
    selectedRef.current = selectedIndex;
  }, [selectedIndex]);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset highlight before paint
    setSelectedIndex(-1);
  }, [resetKey, itemCount]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || itemCount === 0 || e.isComposing) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        onKeyboardNav?.();
        setSelectedIndex((i) => {
          const next = i === -1 ? 0 : i < itemCount - 1 ? i + 1 : i;
          onActiveOptionChange?.(next);
          return next;
        });
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onKeyboardNav?.();
        setSelectedIndex((i) => {
          const next = i > 0 ? i - 1 : -1;
          onActiveOptionChange?.(next);
          return next;
        });
        return;
      }

      if (e.key === 'Enter') {
        if (isInteractiveTarget(document.activeElement)) return;

        const current = selectedRef.current;
        if (current < 0) return; // no row highlighted yet

        e.preventDefault();
        onSelect(current);
      }
    },
    [enabled, itemCount, onSelect, onKeyboardNav, onActiveOptionChange],
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {selectedIndex, setSelectedIndex};
}
