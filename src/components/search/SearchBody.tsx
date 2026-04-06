import {useEffect, useRef, type RefObject} from 'react';
import {SearchResultItem} from './SearchResultItem';
import {useSearchState} from './SearchContext';

type SearchBodyProps = {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  pointerHoverAllowed: boolean;
  selectedIndex: number;
  onHighlight: (index: number) => void;
  onSelect: (index: number) => void;
};

export function SearchBody({
  scrollContainerRef,
  pointerHoverAllowed,
  selectedIndex,
  onHighlight,
  onSelect,
}: SearchBodyProps) {
  const {query, results, loading, hasQuery, resetKey} = useSearchState();
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({top: 0, behavior: 'smooth'});
  }, [resetKey, scrollContainerRef]);

  useEffect(() => {
    if (selectedIndex < 0) return;
    const el = listRef.current?.querySelector(
      `[data-index="${selectedIndex}"]`,
    );
    el?.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }, [selectedIndex]);

  if (loading && results.length === 0) {
    return (
      <div className='flex min-h-48 flex-col items-center justify-center px-3 py-8 text-sm text-muted md:px-4'>
        Searching…
      </div>
    );
  }

  if (hasQuery && !loading && results.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center px-3 py-10 text-center text-sm text-muted md:px-4'>
        No results for {query}
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <ul
      ref={listRef}
      role='listbox'
      aria-label='Search results'
      className='flex flex-col gap-0.5 px-3 pb-2 pt-1 mb-2 md:px-4 bg-secondary'
    >
      {results.map((doc, i) => (
        <SearchResultItem
          key={doc.id}
          doc={doc}
          index={i}
          isSelected={selectedIndex === i}
          pointerHoverAllowed={pointerHoverAllowed}
          onSelect={onSelect}
          onHighlight={onHighlight}
        />
      ))}
    </ul>
  );
}
