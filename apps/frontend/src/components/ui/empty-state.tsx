'use client';

import React, { FC, ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * "Nothing here yet" panel. The icon sits on a tactile clay tile with a
 * brand-gradient ring — one of the few places the gradient is allowed — and
 * the panel rises in once on mount (motion is disabled by reduced-motion).
 */
export const EmptyState: FC<EmptyStateProps> = ({ icon, title, description, action, className }) => {
  return (
    <div
      className={`vp-rise bg-newBgColorInner border border-newTableBorder rounded-vpLg p-[32px] flex flex-col items-center gap-[12px] text-center ${className || ''}`}
    >
      {icon && (
        <div className="vp-gradient p-[2px] rounded-vpLg shadow-elev2" aria-hidden="true">
          <div className="w-[56px] h-[56px] rounded-[14px] bg-newBgColorInner flex items-center justify-center text-btnPrimaryAccent">
            {icon}
          </div>
        </div>
      )}
      <div className="text-[16px] font-[600] tracking-[-0.01em] text-textColor">{title}</div>
      {description && (
        <div className="text-[13px] leading-[1.55] text-newTableText max-w-[340px]">{description}</div>
      )}
      {action && <div className="mt-[8px]">{action}</div>}
    </div>
  );
};
