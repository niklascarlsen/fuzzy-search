import type {SVGProps} from 'react';

export function ArrowUpIcon({
  width = 15,
  height = 15,
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 15 15'
      aria-hidden
      className={className}
      {...props}
    >
      <g
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.2'
      >
        <path d='M7.5 11.5v-8M10.5 6.5l-3-3-3 3' />
      </g>
    </svg>
  );
}
