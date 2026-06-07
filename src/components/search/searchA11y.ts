// Safari: activedescendant on searchbox is ignored - announce via live region instead.
export function needsOptionLiveAnnouncement(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /AppleWebKit/i.test(ua) && !/Chrom(e|ium)|Edg\//.test(ua);
}

export const SEARCH_DIALOG_ID = 'search-dialog';
export const SEARCH_TITLE_ID = 'search-title';
export const SEARCH_HINTS_ID = 'search-hints';
export const SEARCH_LISTBOX_ID = 'search-listbox';
export const SEARCH_STATUS_ID = 'search-status';

export const SEARCH_FIELD_HINTS =
  'Type to search movies. Arrow up and arrow down to move through results. Press Enter to select. Press Escape to close.';

export function searchOptionId(index: number): string {
  return `${SEARCH_LISTBOX_ID}-option-${index}`;
}

export function searchOptionLabel(
  name: string,
  description: string,
  index: number,
  total: number,
): string {
  return `${index + 1} of ${total}. ${name}. ${description}.`;
}

// Safari live region: reset then set so VoiceOver can interrupt prior speech.
export function updateOptionLiveRegion(
  el: HTMLElement,
  message: string | null,
): void {
  el.setAttribute('aria-live', 'off');
  el.textContent = '';
  if (message === null) {
    el.setAttribute('aria-live', 'assertive');
    return;
  }
  requestAnimationFrame(() => {
    el.setAttribute('aria-live', 'assertive');
    el.textContent = message;
  });
}

export function searchResultCountLabel(count: number): string {
  return count === 1 ? '1 result' : `${count} results`;
}

export function searchNoResultsLabel(query: string): string {
  return `No results for ${query}`;
}

export function getSearchStatusMessage(
  trimmedDeferred: string,
  trimmedImmediate: string,
  dataLoading: boolean,
  resultCount: number,
): string {
  if (trimmedImmediate !== trimmedDeferred) return '';

  const hasQuery = trimmedDeferred.length > 0;
  if (!hasQuery) return '';

  // Index still loading - skip status so we don't say "No results" too early.
  if (dataLoading && resultCount === 0) return '';

  if (resultCount === 0) return searchNoResultsLabel(trimmedDeferred);

  return `${trimmedDeferred}, ${searchResultCountLabel(resultCount)}. Arrow down to navigate results.`;
}
