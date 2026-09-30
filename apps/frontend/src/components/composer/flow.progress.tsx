'use client';

import { FC } from 'react';
import clsx from 'clsx';
import { useT } from '@validpost/react/translation/get.transation.service.client';
import {
  ComposerFlow as ComposerFlowState,
  FlowStep,
  FlowStepId,
} from '@validpost/frontend/components/composer/flow';

interface ComposerFlowProps {
  flow: ComposerFlowState;
  /** AI assistant available: makes the optional "Improve" step actionable. */
  aiActive: boolean;
  /** Preview / Improve are the only steps that act on click. */
  onStepClick?: (id: FlowStepId) => void;
  /** Hide the helper line (used where space is tight). */
  hideHint?: boolean;
  className?: string;
}

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

const SparkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z" />
  </svg>
);

const ORDER: FlowStepId[] = ['create', 'preview', 'improve', 'schedule', 'publish'];
// Improve is optional and shows a spark icon, so only these get a number.
const NUMBERED: FlowStepId[] = ['create', 'preview', 'schedule', 'publish'];

export const ComposerFlow: FC<ComposerFlowProps> = ({
  flow,
  aiActive,
  onStepClick,
  hideHint,
  className,
}) => {
  const t = useT();

  const labels: Record<FlowStepId, string> = {
    create: t('flow_create', 'Create'),
    preview: t('flow_preview', 'Preview'),
    improve: t('flow_improve', 'Improve'),
    schedule: t('flow_schedule', 'Schedule'),
    publish: t('flow_publish', 'Publish'),
  };

  const hints = {
    write: t('flow_hint_write', 'Start with your message — or add some media.'),
    pick_channel: t('flow_hint_pick_channel', 'Pick a channel to see your live preview.'),
    pick_time: t('flow_hint_pick_time', 'That time has passed — choose a new one.'),
    ready: t('flow_hint_ready', 'Looking good. Schedule it, or post it now.'),
  } as const;

  const stepStatus = (s: FlowStep) =>
    s.state === 'done'
      ? t('flow_status_done', 'done')
      : s.state === 'current'
      ? t('flow_status_current', 'current step')
      : s.state === 'optional'
      ? t('flow_status_optional', 'optional')
      : t('flow_status_todo', 'to do');

  // Only Preview (mobile: jump to the preview tab) and Improve (open the
  // assistant, when AI is on) do anything when pressed.
  const isActionable = (id: FlowStepId) =>
    !!onStepClick && (id === 'preview' || (id === 'improve' && aiActive));

  const byId = Object.fromEntries(flow.steps.map((s) => [s.id, s])) as Record<FlowStepId, FlowStep>;

  return (
    <div className={clsx('flex flex-col gap-[6px] min-w-0', className)}>
      <nav aria-label={t('flow_aria', 'Post progress')}>
        <ol className="flex items-center gap-[4px] overflow-x-auto scrollbar-none py-[2px]">
          {ORDER.map((id, index) => {
            const step = byId[id];
            const actionable = isActionable(id);
            const inner = (
              <>
                <span
                  aria-hidden="true"
                  className={clsx(
                    'w-[22px] h-[22px] shrink-0 rounded-full flex items-center justify-center text-[11px] font-[700] border transition-colors duration-200',
                    step.state === 'done' && 'bg-btnPrimary border-btnPrimary text-white',
                    step.state === 'current' &&
                      'border-btnPrimary text-btnPrimaryAccent bg-btnPrimary/10 shadow-[0_0_0_3px_color-mix(in_srgb,var(--new-btn-primary)_18%,transparent)]',
                    step.state === 'todo' && 'border-newTableBorder text-newTableText',
                    step.state === 'optional' && 'border-dashed border-newTableText/50 text-newTableText'
                  )}
                >
                  {step.state === 'done' ? (
                    <CheckIcon />
                  ) : id === 'improve' ? (
                    <SparkIcon />
                  ) : (
                    NUMBERED.indexOf(id) + 1
                  )}
                </span>
                <span
                  className={clsx(
                    'text-[12px] font-[600] whitespace-nowrap',
                    step.state === 'current' ? 'text-textColor' : 'text-newTableText'
                  )}
                >
                  {labels[id]}
                </span>
                <span className="sr-only">{`, ${stepStatus(step)}`}</span>
              </>
            );

            return (
              <li key={id} className="flex items-center gap-[4px] shrink-0">
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className={clsx(
                      'w-[14px] h-px shrink-0 transition-colors duration-200',
                      byId[ORDER[index - 1]].state === 'done' && step.state !== 'todo'
                        ? 'bg-btnPrimary'
                        : 'bg-newTableBorder'
                    )}
                  />
                )}
                {actionable ? (
                  <button
                    type="button"
                    onClick={() => onStepClick?.(id)}
                    aria-current={step.state === 'current' ? 'step' : undefined}
                    className="flex items-center gap-[6px] rounded-full ps-[2px] pe-[8px] py-[2px] min-h-[28px] hover:bg-boxHover transition-colors"
                  >
                    {inner}
                  </button>
                ) : (
                  <span
                    aria-current={step.state === 'current' ? 'step' : undefined}
                    className="flex items-center gap-[6px] ps-[2px] pe-[8px] py-[2px] min-h-[28px]"
                  >
                    {inner}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {!hideHint && (
        <p
          aria-live="polite"
          className="text-[12px] text-newTableText leading-[1.3] truncate"
        >
          {hints[flow.hint]}
        </p>
      )}
    </div>
  );
};
