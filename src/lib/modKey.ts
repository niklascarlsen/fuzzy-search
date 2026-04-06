const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

const isMac = /Mac|iPhone|iPad|iPod/i.test(userAgent);
const isMobilePhone = /Mobi/i.test(userAgent);

export const MOD_KEY_LABEL = isMac ? '⌘' : 'Ctrl';

export const SEARCH_SHORTCUT_LABEL: string | null = isMobilePhone
  ? null
  : `${MOD_KEY_LABEL} K`;
