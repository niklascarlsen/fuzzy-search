import {useDeferredValue, useEffect, useMemo, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import type {SearchResult} from '@/types/document';
import {filterPages, loadPages} from '@/lib/searchData';
import {SearchActionsContext, SearchStateContext} from './SearchContext';
import type {SearchActionsValue, SearchStateValue} from './SearchContext';

type SearchProviderProps = {
  children: ReactNode;
};

export function SearchProvider({children}: SearchProviderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [dataReady, setDataReady] = useState(false);

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

  const stateValue = useMemo<SearchStateValue>(
    () => ({
      inputRef,
      query,
      deferredQuery,
      results,
      loading,
      hasQuery,
      resetKey: deferredQuery,
    }),
    [query, results, loading, hasQuery, deferredQuery],
  );

  const actionsValue = useMemo<SearchActionsValue>(() => ({setQuery}), []);

  return (
    <SearchActionsContext.Provider value={actionsValue}>
      <SearchStateContext.Provider value={stateValue}>
        {children}
      </SearchStateContext.Provider>
    </SearchActionsContext.Provider>
  );
}
