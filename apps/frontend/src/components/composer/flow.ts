/**
 * The composer's guided flow: Create → Preview → Improve → Schedule → Publish.
 *
 * Pure and derived — it reads no store and renders nothing, so it can be unit
 * tested and reused by any surface that wants to explain "what's next".
 * `improve` is always optional (AI assistance / preflight); the other four
 * steps advance from real composer state.
 */
export type FlowStepId = 'create' | 'preview' | 'improve' | 'schedule' | 'publish';
export type FlowStepState = 'done' | 'current' | 'todo' | 'optional';
export type FlowHint = 'write' | 'pick_channel' | 'pick_time' | 'ready';

export interface FlowInput {
  /** Any post has text or media. */
  hasContent: boolean;
  /** Number of selected channels. */
  channelCount: number;
  /** The chosen publish time is now or later. */
  dateOk: boolean;
}

export interface FlowStep {
  id: FlowStepId;
  state: FlowStepState;
}

export interface ComposerFlow {
  steps: FlowStep[];
  /** What the user should do next — drives the helper line and CTA emphasis. */
  hint: FlowHint;
  /** True once nothing blocks scheduling. */
  ready: boolean;
}

/** Visible text of an editor HTML value (tags and non-breaking spaces removed). */
export const editorText = (html: string | undefined | null): string =>
  (html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

export const computeComposerFlow = ({
  hasContent,
  channelCount,
  dateOk,
}: FlowInput): ComposerFlow => {
  const hasChannel = channelCount > 0;
  const ready = hasContent && hasChannel && dateOk;

  const hint: FlowHint = !hasContent
    ? 'write'
    : !hasChannel
    ? 'pick_channel'
    : !dateOk
    ? 'pick_time'
    : 'ready';

  // First unmet required step is "current"; earlier ones are done, later todo.
  const required: { id: FlowStepId; done: boolean }[] = [
    { id: 'create', done: hasContent },
    { id: 'preview', done: hasChannel },
    { id: 'schedule', done: hasContent && hasChannel && dateOk },
    { id: 'publish', done: false },
  ];
  const currentIndex = required.findIndex((s) => !s.done);

  const stateFor = (id: FlowStepId, index: number): FlowStepState => {
    const step = required[index];
    if (step.done) return 'done';
    return index === currentIndex ? 'current' : 'todo';
  };

  const steps: FlowStep[] = [
    { id: 'create', state: stateFor('create', 0) },
    { id: 'preview', state: stateFor('preview', 1) },
    { id: 'improve', state: 'optional' },
    { id: 'schedule', state: stateFor('schedule', 2) },
    { id: 'publish', state: stateFor('publish', 3) },
  ];

  return { steps, hint, ready };
};
