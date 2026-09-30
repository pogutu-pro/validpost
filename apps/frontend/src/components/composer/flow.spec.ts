import { describe, it, expect } from 'vitest';
import { computeComposerFlow, editorText } from './flow';

const states = (input: Parameters<typeof computeComposerFlow>[0]) =>
  Object.fromEntries(
    computeComposerFlow(input).steps.map((s) => [s.id, s.state])
  );

describe('computeComposerFlow', () => {
  it('starts on Create when the composer is empty', () => {
    const flow = computeComposerFlow({
      hasContent: false,
      channelCount: 0,
      dateOk: true,
    });
    expect(flow.hint).toBe('write');
    expect(flow.ready).toBe(false);
    expect(states({ hasContent: false, channelCount: 0, dateOk: true })).toEqual({
      create: 'current',
      preview: 'todo',
      improve: 'optional',
      schedule: 'todo',
      publish: 'todo',
    });
  });

  it('moves to Preview once there is content but no channel', () => {
    const flow = computeComposerFlow({
      hasContent: true,
      channelCount: 0,
      dateOk: true,
    });
    expect(flow.hint).toBe('pick_channel');
    expect(states({ hasContent: true, channelCount: 0, dateOk: true })).toMatchObject({
      create: 'done',
      preview: 'current',
      schedule: 'todo',
    });
  });

  it('waits on Schedule when the chosen time is in the past', () => {
    const flow = computeComposerFlow({
      hasContent: true,
      channelCount: 2,
      dateOk: false,
    });
    expect(flow.hint).toBe('pick_time');
    expect(flow.ready).toBe(false);
    expect(states({ hasContent: true, channelCount: 2, dateOk: false })).toMatchObject({
      create: 'done',
      preview: 'done',
      schedule: 'current',
    });
  });

  it('is ready to publish when content, a channel and a valid time exist', () => {
    const flow = computeComposerFlow({
      hasContent: true,
      channelCount: 1,
      dateOk: true,
    });
    expect(flow.hint).toBe('ready');
    expect(flow.ready).toBe(true);
    expect(states({ hasContent: true, channelCount: 1, dateOk: true })).toEqual({
      create: 'done',
      preview: 'done',
      improve: 'optional',
      schedule: 'done',
      publish: 'current',
    });
  });

  it('keeps Improve optional in every state', () => {
    for (const hasContent of [true, false]) {
      for (const channelCount of [0, 1]) {
        expect(
          states({ hasContent, channelCount, dateOk: true }).improve
        ).toBe('optional');
      }
    }
  });
});

describe('editorText', () => {
  it('strips tags and non-breaking spaces', () => {
    expect(editorText('<p>Hello&nbsp;<strong>world</strong></p>')).toBe('Hello world');
  });

  it('treats an empty paragraph as no text', () => {
    expect(editorText('<p></p>')).toBe('');
    expect(editorText('<p>&nbsp;</p>')).toBe('');
    expect(editorText(undefined)).toBe('');
  });
});
