'use client';

export const Logo = ({
  size = 60,
  className = 'mt-[8px]',
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={{ minWidth: size, minHeight: size }}
    >
      <rect width="64" height="64" rx="14" fill="#4F46E5" />
      <path
        d="M18 32.5L28 42L46 22"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
