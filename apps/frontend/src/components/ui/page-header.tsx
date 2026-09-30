import React, { FC, ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const PageHeader: FC<PageHeaderProps> = ({ title, description, action }) => {
  return (
    <div className="flex items-center justify-between gap-[12px] mobile:flex-col mobile:items-stretch mb-[20px]">
      <div>
        <h1 className="text-[24px] mobile:text-[22px] font-[600] tracking-[-0.02em] text-textColor">{title}</h1>
        {description && (
          <p className="text-[13px] text-newTableText mt-[4px]">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-[8px] mobile:flex-wrap">{action}</div>
      )}
    </div>
  );
};
