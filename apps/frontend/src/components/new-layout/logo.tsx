'use client';

import { useId } from 'react';

/**
 * ValidPost mark: a speech-bubble "post" tile in the brand gradient with a
 * check inside — "valid" + "post". Gradient ids are per-instance so several
 * logos can share a page.
 */
export const Logo = ({
  size = 60,
  className = 'mt-[8px]',
}: {
  size?: number;
  className?: string;
}) => {
  const id = useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={{ minWidth: size, minHeight: size }}
      role="img"
      aria-label="ValidPost"
    >
      <defs>
        <linearGradient id={id} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#833AB4" />
          <stop offset="0.52" stopColor="#E1306C" />
          <stop offset="1" stopColor="#F77737" />
        </linearGradient>
      </defs>
      <path
        d="M32 3C15.4 3 3 14.6 3 29.5c0 8.2 3.9 15.4 10 20.1V60l10.7-6.2c2.6.7 5.4 1.1 8.3 1.1 16.6 0 29-11.6 29-26.4S48.6 3 32 3Z"
        fill={`url(#${id})`}
      />
      <path
        d="M20 30.5 28.5 39 44.5 21.5"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
