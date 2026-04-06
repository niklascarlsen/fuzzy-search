import {useSearchActions, useSearchState} from './SearchContext';
import {SearchInput} from './SearchInput';

export function SearchModalHeader() {
  const {inputRef, query} = useSearchState();
  const {setQuery, closeModal} = useSearchActions();

  return (
    <div className='shrink-0 bg-secondary px-3 pb-2 pt-3 md:px-4 md:pb-4 md:pt-4'>
      <div className='flex items-center gap-2'>
        <div className='min-w-0 flex-1'>
          <SearchInput
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            placeholder='Search movies'
            aria-label='Search'
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
