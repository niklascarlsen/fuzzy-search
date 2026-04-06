import type {IndexedDocument, MatchReason} from '@/types/document';
import {hasTypoMatch, isAcronymMatch} from './searchFuzzy';

/**
 * Toggle to surface debug overlays in the search results (score + match
 * reasons). Flip to `true` to inspect why a result ranks.
 */
export const SEARCH_DEBUG_UI = false;

const SCORES = {
  EXACT_NAME: 300,
  EXACT_TAG: 200,
  PREFIX_NAME: 150,
  PREFIX_TAG: 100,
  CONTAINS_NAME: 80,
  CONTAINS_TAG: 60,
  CONTAINS_DESC: 10,
  SUBSEQ_NAME: 20,
  TYPO_NAME: 10,
} as const;

export const MATCH_REASON_ORDER: readonly MatchReason[] = [
  'name',
  'tag',
  'desc',
  'acronym',
  'typo',
];

export const MATCH_REASON_LABEL: Record<MatchReason, string> = {
  name: 'Name',
  tag: 'Tag',
  desc: 'Description',
  acronym: 'Acronym',
  typo: 'Typo',
};

function sortMatchReasons(reasons: Set<MatchReason>): MatchReason[] {
  return MATCH_REASON_ORDER.filter((r) => reasons.has(r));
}

function scorePageMatch(
  page: IndexedDocument,
  tokens: string[],
  fullQuery: string,
  trackReasons: boolean,
): {score: number; reasons: Set<MatchReason> | null} {
  const reasons = trackReasons ? new Set<MatchReason>() : null;
  const add = (r: MatchReason) => {
    reasons?.add(r);
  };

  let score = 0;

  if (page.nameLower === fullQuery) {
    score += SCORES.EXACT_NAME;
    add('name');
  }
  if (page.tagLower === fullQuery) {
    score += SCORES.EXACT_TAG;
    add('tag');
  }

  for (const token of tokens) {
    let tokenScore = 0;

    if (page.nameWords.includes(token)) {
      tokenScore += SCORES.EXACT_NAME;
      add('name');
    } else if (page.nameWords.some((w) => w.startsWith(token))) {
      tokenScore += SCORES.PREFIX_NAME;
      add('name');
    } else if (token.length >= 3 && page.nameLower.includes(token)) {
      tokenScore += SCORES.CONTAINS_NAME;
      add('name');
    }

    if (page.tagList.includes(token)) {
      tokenScore += SCORES.EXACT_TAG;
      add('tag');
    } else if (page.tagList.some((t) => t.startsWith(token))) {
      tokenScore += SCORES.PREFIX_TAG;
      add('tag');
    } else if (token.length >= 3 && page.tagLower.includes(token)) {
      tokenScore += SCORES.CONTAINS_TAG;
      add('tag');
    }

    if (token.length >= 3 && page.descLower.includes(token)) {
      tokenScore += SCORES.CONTAINS_DESC;
      add('desc');
    }

    if (tokenScore === 0) {
      if (isAcronymMatch(token, page.nameWords)) {
        tokenScore += SCORES.SUBSEQ_NAME;
        add('acronym');
      } else if (hasTypoMatch(token, page.nameWords)) {
        tokenScore += SCORES.TYPO_NAME;
        add('typo');
      }
    }

    if (tokenScore === 0) {
      return {score: 0, reasons: null};
    }

    score += tokenScore;
  }

  return {score, reasons};
}

export function calculateScore(
  page: IndexedDocument,
  tokens: string[],
  fullQuery: string,
): number {
  return scorePageMatch(page, tokens, fullQuery, false).score;
}

export function analyzeMatch(
  page: IndexedDocument,
  tokens: string[],
  fullQuery: string,
): {score: number; reasons: MatchReason[]} {
  const {score, reasons} = scorePageMatch(page, tokens, fullQuery, true);
  return {
    score,
    reasons: reasons ? sortMatchReasons(reasons) : [],
  };
}
