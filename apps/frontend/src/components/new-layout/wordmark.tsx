'use client';

import { useT } from '@validpost/react/translation/get.transation.service.client';

export const Wordmark = ({
  height = 20,
  className = '',
}: {
  height?: number;
  className?: string;
}) => {
  const t = useT();
  return (
    <span
      role="img"
      aria-label={t('wordmark_aria_label', 'ValidPost')}
      className={`inline-flex items-center font-bold tracking-tight text-textColor ${className}`}
      style={{ fontSize: `${height}px`, lineHeight: 1 }}
    >
      ValidPost
    </span>
  );
};
