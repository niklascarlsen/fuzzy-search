import type {ReactNode} from 'react';

type KbdProps = {
  children: ReactNode;
  className?: string;
};

export function Kbd({children, className = ''}: KbdProps) {
  return (
    <kbd
      className={`inline-flex bg-background min-h-5.5 min-w-5.5 items-center justify-center rounded-sm border border-white/5 px-1.5 py-1 text-[10px] font-bold leading-none text-foreground/70 shadow-sm [&_svg]:block [&_svg]:shrink-0 ${className}`}
    >
      {children}
    </kbd>
  );
}
