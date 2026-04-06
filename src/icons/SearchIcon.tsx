import type {SVGProps} from 'react';

const defaultFieldPosition = 'absolute left-3.5 top-1/2 -translate-y-1/2';

export default function SearchIcon({
  width = '1em',
  height = '1em',
  className,
  ...props
}: SVGProps<SVGSVGElement> = {}) {
  const defaultFieldClass = `${defaultFieldPosition} text-primary`;

  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 20 20'
      className={className ?? defaultFieldClass}
      aria-hidden
      {...props}
    >
      <path
        d='M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z'
        stroke='currentColor'
        fill='none'
        fillRule='evenodd'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  );
}
