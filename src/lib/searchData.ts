import type {
  IndexedDocument,
  RawDocument,
  SearchResult,
} from '@/types/document';
import {preparePage, highlightTextAsSafeHtml} from './searchDocument';
import {SEARCH_DEBUG_UI, analyzeMatch, calculateScore} from './searchEngine';

type MoviesModule = {
  default: RawDocument[];
};

const MAX_RESULTS = 13;

let preparedPages: IndexedDocument[] = [];
let loadPromise: Promise<void> | null = null;

/**
 * Lazily imports and prepares the movie dataset. Resolves once the index
 * is ready; subsequent callers reuse the same promise.
 */
export function loadPages(): Promise<void> {
  if (!loadPromise) {
    loadPromise = import('@/data/movies_1000.json').then((module) => {
      const data = module as MoviesModule;
      preparedPages = data.default.map(preparePage);
    });
  }
  return loadPromise;
}

export function filterPages(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const tokens = q.split(/\s+/);

  return preparedPages
    .map((page) => {
      const match = SEARCH_DEBUG_UI
        ? analyzeMatch(page, tokens, q)
        : {score: calculateScore(page, tokens, q), reasons: []};

      return {page, match};
    })
    .filter(({match}) => match.score > 0)
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, MAX_RESULTS)
    .map(({page, match}) => ({
      ...page,
      score: match.score,
      matchReasons: match.reasons,
      highlightedName: highlightTextAsSafeHtml(page.name, tokens),
      highlightedDesc: highlightTextAsSafeHtml(page.short_description, tokens),
    }));
}
