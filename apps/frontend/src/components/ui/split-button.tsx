'use client';

import { FC, ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';

export interface SplitButtonItem {
  key: string;
  label: string;
  /** Optional one-line explanation under the label. */
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  onSelect: () => void;
}

interface SplitButtonProps {
  /** Primary action label. */
  label: ReactNode;
  onClick: () => void;
  items: SplitButtonItem[];
  /** Accessible name of the chevron button. */
  menuLabel: string;
  disabled?: boolean;
  loading?: boolean;
  /** Where the menu opens relative to the button. */
  placement?: 'top' | 'bottom';
  className?: string;
}

/**
 * Primary action with a secondary-actions menu. Unlike the hover menus it
 * replaces, it opens on click / Enter / Space, works on touch, closes on
 * outside click, Escape and selection, and supports arrow-key navigation.
 * Uses the tactile `.vp-clay` treatment: reserve for the ONE primary action.
 */
export const SplitButton: FC<SplitButtonProps> = ({
  label,
  onClick,
  items,
  menuLabel,
  disabled,
  loading,
  placement = 'top',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [open, close]);

  // Focus the first enabled item when the menu opens.
  useEffect(() => {
    if (!open) return;
    rootRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')
      ?.focus();
  }, [open]);

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
      return;
    }
    if (e.key === 'Tab') {
      close();
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const nodes = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not(:disabled)'
      ) ?? []
    );
    if (!nodes.length) return;
    const index = nodes.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      e.key === 'ArrowDown'
        ? (index + 1) % nodes.length
        : (index - 1 + nodes.length) % nodes.length;
    nodes[next].focus();
  };

  const blocked = disabled || loading;
  const hasMenu = items.length > 0;

  return (
    <div ref={rootRef} className={clsx('relative inline-flex', className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={blocked}
        aria-busy={loading || undefined}
        className={clsx(
          'vp-clay relative flex-1 min-w-0 h-[44px] mobile:h-[48px] ps-[20px] text-[15px] font-[600] flex items-center justify-center gap-[8px]',
          hasMenu ? 'pe-[16px] rounded-e-none!' : 'pe-[20px]'
        )}
      >
        {loading && (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="animate-spin h-[18px] w-[18px] border-[3px] border-white border-t-transparent rounded-full" />
          </span>
        )}
        <span className={clsx('truncate', loading && 'invisible')}>{label}</span>
      </button>
      {hasMenu && (
      <button
        ref={toggleRef}
        type="button"
        aria-label={menuLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={blocked}
        onClick={() => setOpen((v) => !v)}
        className="vp-clay h-[44px] mobile:h-[48px] w-[40px] shrink-0 rounded-s-none! border-s border-white/25 flex items-center justify-center"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={clsx(
            'transition-transform duration-200',
            (placement === 'top') !== open && 'rotate-180'
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      )}
      {open && hasMenu && (
        <div
          id={menuId}
          role="menu"
          tabIndex={-1}
          aria-label={menuLabel}
          onKeyDown={onMenuKeyDown}
          className={clsx(
            'vp-rise absolute end-0 z-300 w-[248px] max-w-[calc(100vw-32px)] bg-newBgColorInner border border-newTableBorder rounded-vpLg shadow-elev3 p-[6px] flex flex-col gap-[2px]',
            placement === 'top' ? 'bottom-full mb-[8px]' : 'top-full mt-[8px]'
          )}
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                close();
                item.onSelect();
              }}
              className="text-start rounded-[10px] px-[12px] py-[10px] min-h-[44px] flex items-start gap-[10px] text-textColor hover:bg-boxHover focus-visible:bg-boxHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {item.icon && (
                <span className="mt-[2px] shrink-0 text-btnPrimaryAccent" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="flex flex-col min-w-0">
                <span className="text-[14px] font-[600]">{item.label}</span>
                {item.description && (
                  <span className="text-[12px] text-newTableText leading-[1.35]">
                    {item.description}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
