import {useEffect} from 'react';

function deviceHasCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if (window.matchMedia('(any-pointer: coarse)').matches) return true;
    if (window.matchMedia('(pointer: coarse)').matches) return true;
  } catch {
    /* matchMedia can throw in rare embedding contexts */
  }

  return typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
}

let originalBodyStyles: {
  overflow: string;
  paddingRight: string;
} | null = null;

// Prevents scroll interception when the active touch target is located inside a vertically scrollable container.
function touchTargetCanScrollVertically(target: EventTarget | null): boolean {
  let el: Element | null =
    target instanceof Element
      ? target
      : target instanceof Node
        ? target.parentElement
        : null;
  const root = document.documentElement;

  while (el && el !== root) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    const scrollable =
      overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';

    if (scrollable && el.scrollHeight > el.clientHeight) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

let touchMoveHandler: ((e: TouchEvent) => void) | null = null;
let savedHtmlOverscroll = '';

// Mobile scroll lock strategy
// Standard CSS body overflow: hidded fails on mobile devices during input focus inside full-height modals.
// The appearance of the virtual keyboard triggers a viewport resize, causing the browser to drop the CSS scroll lock.
// This approach actively intercepts non-passive touchmove events to prevent scrolling instead.
function lockTouchScrollLayer() {
  if (typeof window === 'undefined') return;
  if (touchMoveHandler) return;

  touchMoveHandler = (e: TouchEvent) => {
    if (touchTargetCanScrollVertically(e.target)) return;
    e.preventDefault();
  };

  document.addEventListener('touchmove', touchMoveHandler, {
    capture: true,
    passive: false,
  });

  const html = document.documentElement;
  savedHtmlOverscroll = html.style.overscrollBehavior;
  html.style.overscrollBehavior = 'none';
}

function unlockTouchScrollLayer() {
  if (!touchMoveHandler) return;

  document.removeEventListener('touchmove', touchMoveHandler, {capture: true});
  const html = document.documentElement;
  html.style.overscrollBehavior = savedHtmlOverscroll;
  savedHtmlOverscroll = '';
  touchMoveHandler = null;
}

// Standard desktop scroll lock
function lockBodyScroll() {
  const body = document.body;
  const html = document.documentElement;
  const computedStyle = window.getComputedStyle(body);
  const currentPaddingRight =
    Number.parseFloat(computedStyle.paddingRight) || 0;
  const scrollbarWidth = window.innerWidth - html.clientWidth;

  originalBodyStyles = {
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
  };

  body.style.overflow = 'hidden';

  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
  }
}

function unlockBodyScroll() {
  if (!originalBodyStyles) return;

  const body = document.body;
  body.style.overflow = originalBodyStyles.overflow;
  body.style.paddingRight = originalBodyStyles.paddingRight;

  originalBodyStyles = null;
}

export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;

    const isTouchDevice = deviceHasCoarsePointer();

    if (isTouchDevice) {
      lockTouchScrollLayer();
    } else {
      lockBodyScroll();
    }

    return () => {
      if (isTouchDevice) {
        unlockTouchScrollLayer();
      } else {
        unlockBodyScroll();
      }
    };
  }, [isLocked]);
}
