'use client';

import { FC, ReactNode } from 'react';
import clsx from 'clsx';

/**
 * The post lifecycle, as one vocabulary across calendar, lists and reports:
 * draft → scheduled → (publishing) → published, plus failed / needs review.
 * Colour is never the only signal — every state carries an icon and a label.
 */
export type PostStatus =
  | 'draft'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'review';

/** Backend post `state` values → lifecycle status. */
export const postStatusFromState = (state?: string | null): PostStatus | null => {
  switch (state?.toUpperCase()) {
    case 'DRAFT':
      return 'draft';
    case 'QUEUE':
      return 'scheduled';
    case 'PUBLISHING':
      return 'publishing';
    case 'PUBLISHED':
      return 'published';
    case 'ERROR':
      return 'failed';
    default:
      return null;
  }
};

const STATUS: Record<PostStatus, { label: string; tone: string; icon: ReactNode }> = {
  draft: {
    label: 'Draft',
    tone: 'bg-vpDraft/12 text-vpDraft',
    icon: <path d="M4 20h4L19 9l-4-4L4 16v4Z" />,
  },
  scheduled: {
    label: 'Scheduled',
    tone: 'bg-vpScheduled/12 text-vpScheduled',
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </>
    ),
  },
  publishing: {
    label: 'Publishing',
    tone: 'bg-vpScheduled/12 text-vpScheduled',
    icon: <path d="M12 4v10m0-10-4 4m4-4 4 4M5 20h14" />,
  },
  published: {
    label: 'Published',
    tone: 'bg-vpPublished/12 text-vpPublished',
    icon: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  },
  failed: {
    label: 'Failed',
    tone: 'bg-vpFailed/12 text-vpFailed',
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5m0 3v.01" />
      </>
    ),
  },
  review: {
    label: 'Needs review',
    tone: 'bg-vpReview/12 text-vpReview',
    icon: (
      <>
        <path d="M12 4 3 19h18L12 4Z" />
        <path d="M12 10v4m0 3v.01" />
      </>
    ),
  },
};

interface StatusBadgeProps {
  status: PostStatus;
  /** Localised label; falls back to the English default. */
  label?: string;
  className?: string;
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status, label, className }) => {
  const s = STATUS[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full text-[11px] font-[600] leading-[1.4] whitespace-nowrap',
        s.tone,
        className
      )}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={status === 'publishing' ? 'animate-pulse' : undefined}
      >
        {s.icon}
      </svg>
      {label ?? s.label}
    </span>
  );
};
