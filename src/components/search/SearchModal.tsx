import {useCallback, useEffect, useRef, useState} from 'react';
import {
  getSearchStatusMessage,
  needsOptionLiveAnnouncement,
  searchOptionId,
  searchOptionLabel,
  updateOptionLiveRegion,
  SEARCH_DIALOG_ID,
  SEARCH_LISTBOX_ID,
  SEARCH_STATUS_ID,
  SEARCH_TITLE_ID,
} from './searchA11y';
import type {SearchResult} from '@/types/document';
import {useListKeyboardNav} from '@/hooks/useListKeyboardNav';
import {useSearchPointerHover} from '@/hooks/useSearchPointerHover';
import {useScrollLock} from '@/hooks/useScrollLock';
import {useSearchActions, useSearchState} from './SearchContext';
import {SearchModalHeader} from './SearchModalHeader';
import {SearchBody} from './SearchBody';
import {SearchFooter} from './SearchFooter';

const STATUS_DEBOUNCE_MS = 700;
const RESULT_COUNT_DEBOUNCE_MS = 900;
const INPUT_IDLE_MS = 1200; // wait after last keystroke before status speaks

type SearchModalProps = {
  onResultSelect?: (doc: SearchResult) => void;
};

export function SearchModal({onResultSelect}: SearchModalProps = {}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const statusLiveRef = useRef<HTMLDivElement>(null);
  const optionLiveRef = useRef<HTMLDivElement>(null);
  const announcedStatusRef = useRef('');
  const lastSearchKeyAtRef = useRef(0);
  const statusClearTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);
  const [linkFieldHints, setLinkFieldHints] = useState(true);

  const {inputRef, results, resetKey, loading, query, deferredQuery} =
    useSearchState();
  const trimmedDeferred = deferredQuery.trim();
  const trimmedImmediate = query.trim();

  const {setQuery} = useSearchActions();
  const {hoverAllowed, lockHover} = useSearchPointerHover(resetKey);

  useScrollLock(open);

  const statusMessage = getSearchStatusMessage(
    trimmedDeferred,
    trimmedImmediate,
    loading,
    results.length,
  );

  // Sync React open state from dialog toggle/close events.
  // This means HTML (commandfor/command, showModal) is the source of truth.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleToggle = () => {
      if (dialog.open) setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
      setQuery('');
      announcedStatusRef.current = '';
      setLinkFieldHints(true);
    };

    dialog.addEventListener('toggle', handleToggle);
    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('toggle', handleToggle);
      dialog.removeEventListener('close', handleClose);
    };
  }, [setQuery]);

  // Cmd+K / Ctrl+K global shortcut - lives here where dialogRef is available.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (dialog.open) dialog.close();
        else dialog.showModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const markSearchInputActivity = useCallback(() => {
    lastSearchKeyAtRef.current = Date.now();
    setLinkFieldHints(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (trimmedImmediate !== trimmedDeferred) return;

    const debounceMs =
      trimmedDeferred.length > 0 && results.length > 0
        ? RESULT_COUNT_DEBOUNCE_MS
        : STATUS_DEBOUNCE_MS;

    let timer: ReturnType<typeof setTimeout>;

    const publish = () => {
      const idle = Date.now() - lastSearchKeyAtRef.current;
      if (idle < INPUT_IDLE_MS) {
        timer = window.setTimeout(publish, INPUT_IDLE_MS - idle);
        return;
      }

      const el = statusLiveRef.current;
      if (!el) return;

      const imm = query.trim();
      const def = deferredQuery.trim();
      if (imm !== def) return;

      const msg = getSearchStatusMessage(def, imm, loading, results.length);
      if (!msg) return;
      if (msg === announcedStatusRef.current) return;
      announcedStatusRef.current = msg;
      el.setAttribute('aria-live', 'polite');
      el.textContent = msg;

      // Drop text after speak so arrow-up back to the field doesn't re-read it.
      if (results.length > 0) {
        if (statusClearTimerRef.current)
          clearTimeout(statusClearTimerRef.current);
        statusClearTimerRef.current = window.setTimeout(() => {
          if (el.textContent !== msg) return;
          el.setAttribute('aria-live', 'off');
          el.textContent = '';
        }, 500);
      }
    };

    timer = window.setTimeout(publish, debounceMs);
    return () => {
      window.clearTimeout(timer);
      if (statusClearTimerRef.current)
        clearTimeout(statusClearTimerRef.current);
    };
  }, [
    open,
    trimmedDeferred,
    trimmedImmediate,
    loading,
    results.length,
    query,
    deferredQuery,
  ]);

  const querySettled = trimmedImmediate === trimmedDeferred;

  const handleSelectIndex = useCallback(
    (index: number) => {
      const doc = results[index];
      if (!doc) return;
      onResultSelect?.(doc);
      dialogRef.current?.close();
    },
    [results, onResultSelect],
  );

  const optionLiveRegion = needsOptionLiveAnnouncement();

  const announceActiveOption = useCallback(
    (index: number) => {
      if (!optionLiveRegion) return;
      const el = optionLiveRef.current;
      if (!el) return;

      if (index < 0) {
        updateOptionLiveRegion(el, null);
        return;
      }

      const doc = results[index];
      if (!doc) return;
      updateOptionLiveRegion(
        el,
        searchOptionLabel(
          doc.name,
          doc.short_description,
          index,
          results.length,
        ),
      );
    },
    [optionLiveRegion, results],
  );

  const {selectedIndex, setSelectedIndex} = useListKeyboardNav(results.length, {
    enabled: open && results.length > 0,
    onSelect: handleSelectIndex,
    resetKey,
    onKeyboardNav: lockHover,
    onActiveOptionChange: announceActiveOption,
  });

  const listboxVisible = results.length > 0;
  const statusVisible = statusMessage.length > 0;
  const ariaExpanded = open && (listboxVisible || statusVisible);
  const ariaControls = listboxVisible
    ? SEARCH_LISTBOX_ID
    : statusVisible
      ? SEARCH_STATUS_ID
      : undefined;
  const activeDescendantId =
    !optionLiveRegion && listboxVisible && selectedIndex >= 0
      ? searchOptionId(selectedIndex)
      : undefined;

  useEffect(() => {
    if (!open) return;
    lockHover();
    inputRef.current?.focus();
  }, [open, inputRef, lockHover]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) dialogRef.current.close();
    },
    [],
  );

  const showStatusVisual =
    statusMessage.length > 0 && statusMessage.startsWith('No results');

  return (
    <dialog
      ref={dialogRef}
      id={SEARCH_DIALOG_ID}
      tabIndex={-1}
      aria-labelledby={SEARCH_TITLE_ID}
      onClick={handleBackdropClick}
      className='search-modal'
    >
      <div
        className='search-modal-inner flex h-dvh w-full min-w-0 max-w-full flex-col overflow-hidden bg-secondary md:mx-auto md:max-h-[85vh] md:h-[800px] md:max-w-xl md:rounded-sm md:border md:border-white/10 md:shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <h1 id={SEARCH_TITLE_ID} className='sr-only'>
          Search movies
        </h1>
        <SearchModalHeader
          linkFieldHints={linkFieldHints}
          ariaExpanded={ariaExpanded}
          ariaControls={ariaControls}
          activeDescendantId={activeDescendantId}
          onSearchInputActivity={markSearchInputActivity}
        />
        <div
          ref={statusLiveRef}
          id={SEARCH_STATUS_ID}
          role='status'
          aria-live={querySettled ? 'polite' : 'off'}
          aria-atomic='true'
          className={
            showStatusVisual
              ? 'px-3 py-8 text-center text-sm text-muted md:px-4'
              : 'sr-only'
          }
        />
        <div
          ref={optionLiveRef}
          role='status'
          aria-live='assertive'
          aria-atomic='true'
          className='sr-only'
        />
        <div
          ref={scrollAreaRef}
          tabIndex={-1}
          className='min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-pt-4 scroll-pb-12'
        >
          {!showStatusVisual && (
            <SearchBody
              scrollContainerRef={scrollAreaRef}
              pointerHoverAllowed={hoverAllowed}
              selectedIndex={selectedIndex}
              onHighlight={setSelectedIndex}
              onSelect={handleSelectIndex}
            />
          )}
        </div>
        <div className='hidden shrink-0 md:block'>
          <SearchFooter />
        </div>
      </div>
    </dialog>
  );
}
