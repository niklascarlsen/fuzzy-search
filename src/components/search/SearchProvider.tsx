import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {ReactNode} from 'react';
import type {SearchResult} from '@/types/document';
import {useScrollLock} from '@/hooks/useScrollLock';
import {filterPages, loadPages} from '@/lib/searchData';
import {SearchActionsContext, SearchStateContext} from './SearchContext';
import type {SearchActionsValue, SearchStateValue} from './SearchContext';

type SearchProviderProps = {
  children: ReactNode;
};

export function SearchProvider({children}: SearchProviderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [prevOpen, setPrevOpen] = useState(open);
  const [dataReady, setDataReady] = useState(false);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setQuery('');
  }

  const deferredQuery = useDeferredValue(query);
  const trimmedQuery = deferredQuery.trim();
  const hasQuery = trimmedQuery.length > 0;
  const loading = hasQuery && !dataReady;

  const results = useMemo<SearchResult[]>(() => {
    if (!hasQuery || !dataReady) return [];
    return filterPages(deferredQuery);
  }, [hasQuery, dataReady, deferredQuery]);

  useEffect(() => {
    let cancelled = false;
    loadPages().then(() => {
      if (!cancelled) setDataReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  const toggleModal = useCallback(() => setOpen((isOpen) => !isOpen), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleModal]);

  useScrollLock(open);

  const stateValue = useMemo<SearchStateValue>(
    () => ({
      open,
      inputRef,
      query,
      deferredQuery,
      results,
      loading,
      hasQuery,
      resetKey: deferredQuery,
    }),
    [open, query, results, loading, hasQuery, deferredQuery],
  );

  const actionsValue = useMemo<SearchActionsValue>(
    () => ({
      setOpen,
      openModal,
      closeModal,
      setQuery,
    }),
    [openModal, closeModal],
  );

  return (
    <SearchActionsContext.Provider value={actionsValue}>
      <SearchStateContext.Provider value={stateValue}>
        {children}
      </SearchStateContext.Provider>
    </SearchActionsContext.Provider>
  );
}
