import {useEffect, useRef, type RefObject} from 'react';
import {SearchResultItem} from './SearchResultItem';
import {SEARCH_LISTBOX_ID, searchOptionId} from './searchA11y';
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
  const {results, resetKey} = useSearchState();
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

  if (results.length === 0) {
    return null;
  }

  return (
    <ul
      ref={listRef}
      id={SEARCH_LISTBOX_ID}
      role='listbox'
      aria-label={
        results.length === 1
          ? '1 search result'
          : `${results.length} search results`
      }
      className='flex flex-col gap-0.5 px-3 pb-2 pt-1 mb-2 md:px-4 bg-secondary'
    >
      {results.map((doc, i) => (
        <SearchResultItem
          key={doc.id}
          id={searchOptionId(i)}
          doc={doc}
          index={i}
          resultCount={results.length}
          isSelected={selectedIndex === i}
          pointerHoverAllowed={pointerHoverAllowed}
          onSelect={onSelect}
          onHighlight={onHighlight}
        />
      ))}
    </ul>
  );
}
