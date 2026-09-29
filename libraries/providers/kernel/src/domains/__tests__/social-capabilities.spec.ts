import { describe, it, expect } from 'vitest';
import { PROVIDER_CAPABILITIES } from '../social-capabilities';

describe('PROVIDER_CAPABILITIES', () => {
  it('exposes exactly the retained social providers', () => {
    expect(Object.keys(PROVIDER_CAPABILITIES).sort()).toEqual([
      'discord',
      'facebook',
      'gmb',
      'instagram',
      'instagram-standalone',
      'linkedin',
      'linkedin-page',
      'telegram',
      'threads',
      'tiktok',
      'youtube',
    ]);
  });

  it('does not advertise identifiers without a kernel module', () => {
    // Every advertised identifier must resolve to a registered adapter, or the
    // capability matrix would return undefined at runtime.
    expect(PROVIDER_CAPABILITIES['mastodon']).toBeUndefined();
    expect(PROVIDER_CAPABILITIES['x']).toBeUndefined();
  });
});
