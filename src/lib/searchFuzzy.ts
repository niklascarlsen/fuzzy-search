export function isAcronymMatch(token: string, words: string[]): boolean {
  if (token.length < 2 || token.length > 4) return false;
  const acronym = words.map((w) => w.charAt(0)).join('');
  return acronym.includes(token);
}

export function damerauLevenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 1) return 2;

  const d = Array.from({length: m + 1}, () => Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }
  return d[m][n];
}

export function hasTypoMatch(token: string, words: string[]): boolean {
  if (token.length < 3) return false;

  return words.some((w) => {
    if (damerauLevenshtein(token, w) <= 1) return true;

    if (w.length > token.length) {
      const lengthsToTest = [token.length - 1, token.length, token.length + 1];
      for (const len of lengthsToTest) {
        if (len > 0 && len <= w.length) {
          const wordPrefix = w.substring(0, len);
          if (damerauLevenshtein(token, wordPrefix) <= 1) return true;
        }
      }
    }

    return false;
  });
}
