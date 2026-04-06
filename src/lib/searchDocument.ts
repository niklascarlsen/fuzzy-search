import type {IndexedDocument, RawDocument} from '@/types/document';
import {isAcronymMatch} from './searchFuzzy';

export function preparePage(page: RawDocument, index: number): IndexedDocument {
  const id = page.id ?? index;
  const nameLower = (page.name || '').trim().toLowerCase();
  const tagLower = (page.tag || '').toLowerCase();
  const descLower = (page.short_description || '').toLowerCase();
  const tagList = tagLower ? tagLower.split(/,\s*/) : [];

  const cleanName = nameLower.replace(/[^\p{L}\p{N}\s-]/gu, '');
  const spaceWords = cleanName.split(/\s+/).filter((w) => w.length > 0);
  const hyphenWords = cleanName.split(/[\s-]+/).filter((w) => w.length > 0);
  const nameWords = [...new Set([...spaceWords, ...hyphenWords])];

  return {...page, id, nameLower, tagLower, descLower, tagList, nameWords};
}

function escapeHtml(ch: string): string {
  if (ch === '&') return '&amp;';
  if (ch === '<') return '&lt;';
  if (ch === '>') return '&gt;';
  return ch;
}

export function highlightTextAsSafeHtml(
  text: string,
  tokens: string[],
): string {
  if (!text || tokens.length === 0) return text || '';

  const lower = text.toLowerCase();
  const marks = new Uint8Array(text.length);
  const words = lower.split(/\s+/);

  for (const token of tokens) {
    if (token.length < 2) continue;

    let found = false;
    let pos = 0;

    while (true) {
      const idx = lower.indexOf(token, pos);
      if (idx === -1) break;
      found = true;
      for (let i = idx; i < idx + token.length; i++) marks[i] = 1;
      pos = idx + 1;
    }

    if (!found && isAcronymMatch(token, words)) {
      let tokenIndex = 0;
      let textIndex = 0;

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (tokenIndex < token.length && word.charAt(0) === token[tokenIndex]) {
          marks[textIndex] = 1;
          tokenIndex++;
        }
        textIndex += word.length + 1;
      }
    }
  }

  let result = '';
  let inMark = false;
  for (let i = 0; i < text.length; i++) {
    if (marks[i] && !inMark) {
      result += '<mark>';
      inMark = true;
    } else if (!marks[i] && inMark) {
      result += '</mark>';
      inMark = false;
    }
    result += escapeHtml(text[i]);
  }
  if (inMark) result += '</mark>';

  return result;
}
