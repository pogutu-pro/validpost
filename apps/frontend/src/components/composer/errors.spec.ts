import { describe, it, expect } from 'vitest';
import { friendlyComposerError } from './errors';

const t = (_key: string, fallback: string) => fallback;

describe('friendlyComposerError', () => {
  it('explains an unavailable channel instead of echoing the API message', () => {
    const msg = friendlyComposerError(404, 'Integration not available: linkedin', 'x', t);
    expect(msg).toMatch(/isn't ready to publish yet/i);
    expect(msg).not.toMatch(/Integration not available/);
  });

  it('turns server faults into calm, reassuring copy', () => {
    for (const status of [500, 502, 503]) {
      expect(friendlyComposerError(status, 'TypeError: boom at x.y (z.ts:1)', 'x', t)).toMatch(
        /Your post is safe/
      );
    }
  });

  it('handles permission and rate-limit failures', () => {
    expect(friendlyComposerError(403, 'Forbidden', 'x', t)).toMatch(/permission/i);
    expect(friendlyComposerError(401, undefined, 'x', t)).toMatch(/permission/i);
    expect(friendlyComposerError(429, 'Too Many Requests', 'x', t)).toMatch(/Slow down/i);
  });

  it('passes through short, user-facing validation messages on 4xx', () => {
    expect(friendlyComposerError(400, 'Your post is too long for LinkedIn', 'fallback', t)).toBe(
      'Your post is too long for LinkedIn'
    );
  });

  it('falls back when the message is missing, long, or technical', () => {
    expect(friendlyComposerError(400, undefined, 'fallback', t)).toBe('fallback');
    expect(friendlyComposerError(400, 'a'.repeat(300), 'fallback', t)).toBe('fallback');
    expect(friendlyComposerError(400, 'Error: ECONNREFUSED 127.0.0.1:5432', 'fallback', t)).toBe(
      'fallback'
    );
    expect(friendlyComposerError(422, 'prisma.user.findUnique() failed', 'fallback', t)).toBe(
      'fallback'
    );
  });
});
