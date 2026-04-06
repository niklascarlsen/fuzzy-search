import type {SVGProps} from 'react';

export function EnterIcon({
  width = 15,
  height = 15,
  className,
  strokeWidth = 0.65,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 15 15'
      aria-label='Enter key'
      role='img'
      className={className}
      {...props}
    >
      <g
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
      >
        <path d='M12 3.53088v3c0 1-1 2-2 2H4M7 11.53088l-3-3 3-3'></path>
      </g>
    </svg>
  );
}
