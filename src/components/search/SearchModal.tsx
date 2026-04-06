import {useCallback, useEffect, useRef} from 'react';
import type {SearchResult} from '@/types/document';
import {useListKeyboardNav} from '@/hooks/useListKeyboardNav';
import {useSearchPointerHover} from '@/hooks/useSearchPointerHover';
import {useSearchActions, useSearchState} from './SearchContext';
import {SearchModalHeader} from './SearchModalHeader';
import {SearchBody} from './SearchBody';
import {SearchFooter} from './SearchFooter';

type SearchModalProps = {
  onResultSelect?: (doc: SearchResult) => void;
};

export function SearchModal({onResultSelect}: SearchModalProps = {}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const {open, inputRef, results, resetKey} = useSearchState();
  const {closeModal} = useSearchActions();
  const {hoverAllowed, lockHover} = useSearchPointerHover(resetKey);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => closeModal();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [closeModal]);

  const handleSelectIndex = useCallback(
    (index: number) => {
      const doc = results[index];
      if (!doc) return;
      onResultSelect?.(doc);
      closeModal();
    },
    [results, onResultSelect, closeModal],
  );

  const {selectedIndex, setSelectedIndex} = useListKeyboardNav(results.length, {
    enabled: open && results.length > 0,
    onSelect: handleSelectIndex,
    resetKey,
    onKeyboardNav: lockHover,
  });

  useEffect(() => {
    if (!open) return;
    lockHover();
    inputRef.current?.focus();
  }, [open, inputRef, lockHover]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) closeModal();
    },
    [closeModal],
  );

  return (
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      aria-label='Search'
      onClick={handleBackdropClick}
      className='search-modal'
    >
      <div
        className='flex h-dvh w-full min-w-0 max-w-full flex-col overflow-hidden bg-secondary md:mx-auto md:h-[80vh] md:max-w-xl md:rounded-sm md:border md:border-white/10 md:shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <SearchModalHeader />
        <div
          ref={scrollAreaRef}
          tabIndex={-1}
          className='min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-pt-4 scroll-pb-12'
        >
          <SearchBody
            scrollContainerRef={scrollAreaRef}
            pointerHoverAllowed={hoverAllowed}
            selectedIndex={selectedIndex}
            onHighlight={setSelectedIndex}
            onSelect={handleSelectIndex}
          />
        </div>
        <div className='hidden shrink-0 md:block'>
          <SearchFooter />
        </div>
      </div>
    </dialog>
  );
}
