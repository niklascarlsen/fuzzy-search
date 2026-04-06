import {createContext, useContext} from 'react';
import type {Dispatch, RefObject, SetStateAction} from 'react';
import type {SearchResult} from '@/types/document';

export type SearchStateValue = {
  open: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  results: SearchResult[];
  loading: boolean;
  hasQuery: boolean;
  resetKey: string;
};

export type SearchActionsValue = {
  setOpen: Dispatch<SetStateAction<boolean>>;
  openModal: () => void;
  closeModal: () => void;
  setQuery: Dispatch<SetStateAction<string>>;
};

export const SearchStateContext = createContext<SearchStateValue | null>(null);
export const SearchActionsContext = createContext<SearchActionsValue | null>(
  null,
);

export function useSearchState() {
  const context = useContext(SearchStateContext);
  if (!context) {
    throw new Error('useSearchState must be used within a SearchProvider');
  }
  return context;
}

export function useSearchActions() {
  const context = useContext(SearchActionsContext);
  if (!context) {
    throw new Error('useSearchActions must be used within a SearchProvider');
  }
  return context;
}
