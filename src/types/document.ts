export interface RawDocument {
  id?: number;
  name: string;
  tag: string;
  short_description: string;
}

export interface IdentifiedDocument extends RawDocument {
  id: number;
}

export interface IndexedDocument extends IdentifiedDocument {
  nameLower: string;
  tagLower: string;
  descLower: string;
  tagList: string[];
  nameWords: string[];
}

export type MatchReason = 'name' | 'tag' | 'desc' | 'acronym' | 'typo';

export interface RankedDocument extends IndexedDocument {
  score: number;
  matchReasons: MatchReason[];
}

export interface RenderableSearchResult extends RankedDocument {
  highlightedName: string;
  highlightedDesc: string;
}

export type SearchResult = RenderableSearchResult;
