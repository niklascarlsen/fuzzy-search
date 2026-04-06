import type {SVGProps} from 'react';

export function XIcon({
  width = 20,
  height = 20,
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 20 20'
      className={className}
      {...props}
    >
      <path
        d='M10 10l5.09-5.09L10 10l5.09 5.09L10 10zm0 0L4.91 4.91 10 10l-5.09 5.09L10 10z'
        stroke='currentColor'
        strokeWidth={1.5}
        fill='none'
        fillRule='evenodd'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  );
}
