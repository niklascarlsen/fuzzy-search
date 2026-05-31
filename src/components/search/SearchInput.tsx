import type {ComponentPropsWithoutRef, Ref} from 'react';
import SearchIcon from '@/icons/SearchIcon';
import {XIcon} from '@/icons/XIcon';

type SearchInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'type' | 'value'
> & {
  value: string;
  ref?: Ref<HTMLInputElement>;
  onClear?: () => void;
};

export function SearchInput({
  ref,
  className = '',
  onClear,
  value,
  ...props
}: SearchInputProps) {
  const showClear = Boolean(onClear && value.length > 0);

  const handleClear = () => {
    onClear?.();
    if (ref && typeof ref === 'object' && ref.current) {
      ref.current.focus();
    }
  };

  return (
    <div className='relative'>
      <SearchIcon height={20} width={20} />
      <input
        ref={ref}
        type='text'
        inputMode='search'
        autoComplete='off'
        spellCheck={false}
        value={value}
        className={`w-full rounded-xs border border-primary bg-input h-12 pl-10.5 text-[18px] text-foreground placeholder:text-base placeholder:text-muted outline-none shadow-sm shadow-glow  ${
          showClear ? 'pr-11' : 'pr-8'
        } ${className}`}
        {...props}
      />
      {showClear && (
        <div className='absolute inset-y-0 right-0 flex items-center'>
          <button
            type='button'
            className='animate-search-clear-in group flex h-6 w-6 mr-2.5 rounded-full shrink-0 items-center cursor-pointer justify-center text-primary transition-colors outline-none focus:outline-none focus-visible:ring focus-visible:ring-offset-1 focus-visible:ring-primary focus-visible:ring-offset-background group-focus:text-primary'
            aria-label='Clear search'
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
          >
            <XIcon height={16} width={16} className='text-muted group-focus:text-primary' />
          </button>
        </div>
      )}
    </div>
  );
}
