import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  COMMS_PLATFORM_ENV_MAPPINGS,
  getCommsPlatformCredentials,
  getCommsPlatformDefinition,
  getTelegramPlatformWebhookSecret,
  isCommsPlatformConfigured,
} from './comms-platform-env';

const ALL_VARS = COMMS_PLATFORM_ENV_MAPPINGS.flatMap((m) =>
  m.credentialEnvs.map((c) => c.env),
);
const saved: Record<string, string | undefined> = Object.fromEntries(
  ALL_VARS.map((v) => [v, process.env[v]]),
);

beforeEach(() => {
  for (const v of ALL_VARS) delete process.env[v];
});

afterAll(() => {
  for (const v of ALL_VARS) {
    if (saved[v] === undefined) delete process.env[v];
    else process.env[v] = saved[v];
  }
});

describe('comms-platform-env', () => {
  it('maps discord env vars onto the credential keys', () => {
    process.env.DISCORD_CLIENT_ID = 'app-1';
    process.env.DISCORD_BOT_TOKEN = 'bot-1';
    expect(getCommsPlatformCredentials('discord')).toBeUndefined();
    process.env.DISCORD_PUBLIC_KEY = 'pk-1';
    expect(getCommsPlatformCredentials('discord')).toEqual({
      applicationId: 'app-1',
      botToken: 'bot-1',
      publicKey: 'pk-1',
    });
  });

  it('maps telegram (token-only) credentials', () => {
    expect(isCommsPlatformConfigured('telegram')).toBe(false);
    process.env.TELEGRAM_TOKEN = 'tg-1';
    expect(getCommsPlatformCredentials('telegram')).toEqual({ botToken: 'tg-1' });
    expect(getCommsPlatformDefinition('telegram')?.platformConnect).toBe('env');
  });

  it('has no platform mapping for unknown providers', () => {
    expect(getCommsPlatformDefinition('no-such-provider')).toBeUndefined();
    expect(getCommsPlatformCredentials('no-such-provider')).toBeUndefined();
    expect(isCommsPlatformConfigured('nope')).toBe(false);
  });

  it('derives the telegram platform webhook secret deterministically from the token', () => {
    expect(getTelegramPlatformWebhookSecret()).toBeUndefined();
    process.env.TELEGRAM_TOKEN = 'tg-1';
    const first = getTelegramPlatformWebhookSecret();
    expect(first).toMatch(/^[0-9a-f]{64}$/);
    expect(getTelegramPlatformWebhookSecret()).toBe(first);
    process.env.TELEGRAM_TOKEN = 'tg-2';
    expect(getTelegramPlatformWebhookSecret()).not.toBe(first);
  });
});
