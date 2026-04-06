import type {SVGProps} from 'react';

export function ArrowDownIcon({
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
      aria-label='Arrow down'
      role='img'
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
        <path d='M7.5 3.5v8M10.5 8.5l-3 3-3-3'></path>
      </g>
    </svg>
  );
}
