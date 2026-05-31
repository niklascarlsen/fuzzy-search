import {useSearchActions, useSearchState} from './SearchContext';
import {SearchInput} from './SearchInput';
import {SEARCH_FIELD_HINTS, SEARCH_HINTS_ID} from './searchA11y';

type SearchModalHeaderProps = {
  linkFieldHints: boolean;
  ariaExpanded: boolean;
  ariaControls?: string;
  activeDescendantId?: string;
  /** Resets the idle timer so live status doesn't interrupt typing. */
  onSearchInputActivity?: () => void;
};

export function SearchModalHeader({
  linkFieldHints,
  ariaExpanded,
  ariaControls,
  activeDescendantId,
  onSearchInputActivity,
}: SearchModalHeaderProps) {
  const {inputRef, query} = useSearchState();
  const {setQuery, closeModal} = useSearchActions();

  return (
    <div className='shrink-0 bg-secondary px-3 pb-2 pt-3 md:px-4 md:pb-4 md:pt-4'>
      <p id={SEARCH_HINTS_ID} className='sr-only'>
        {SEARCH_FIELD_HINTS}
      </p>
      <div className='flex items-center gap-2'>
        <div className='min-w-0 flex-1'>
          <SearchInput
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearchInputActivity?.();
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') return;
              onSearchInputActivity?.();
            }}
            onClear={() => setQuery('')}
            placeholder='Search movies'
            role='searchbox'
            aria-label='Search movies'
            aria-describedby={linkFieldHints ? SEARCH_HINTS_ID : undefined}
            aria-expanded={ariaExpanded}
            aria-controls={ariaControls}
            aria-activedescendant={activeDescendantId}
          />
        </div>
        <button
          type='button'
          onClick={closeModal}
          className='shrink-0 rounded-xs h-12 px-1 text-base font-semibold text-primary transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary md:hidden'
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
