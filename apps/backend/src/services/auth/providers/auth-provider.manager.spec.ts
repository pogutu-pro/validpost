import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { AuthProviderManager } from './auth-provider.manager';

const ORIGINAL_ENV = { ...process.env };

// Every env var the getProviders env fallback can key on. Fallback tests must
// start from a clean slate so developer-machine / CI env cannot leak providers
// into the advertised list.
const PROVIDER_ENV_VARS = [
  'IS_GENERAL',
  'VALIDPOST_GENERIC_OAUTH',
  'VALIDPOST_OAUTH_CLIENT_ID',
  'VALIDPOST_OAUTH_CLIENT_SECRET',
  'VALIDPOST_OAUTH_AUTH_URL',
  'VALIDPOST_OAUTH_TOKEN_URL',
  'VALIDPOST_OAUTH_USERINFO_URL',
  'NEXT_PUBLIC_VALIDPOST_OAUTH_DISPLAY_NAME',
  'YOUTUBE_CLIENT_ID',
  'YOUTUBE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'NEYNAR_CLIENT_ID',
  'STRIPE_PUBLISHABLE_KEY',
  'FACEBOOK_SSO_ENABLED',
  'FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET',
  'X_SSO_ENABLED',
  'X_API_KEY',
  'X_API_SECRET',
  'X_CLIENT_ID',
  'X_CLIENT_SECRET',
  'LINKEDIN_SSO_ENABLED',
  'LINKEDIN_CLIENT_ID',
  'LINKEDIN_CLIENT_SECRET',
  'APPLE_SSO_ENABLED',
  'APPLE_CLIENT_ID',
  'APPLE_TEAM_ID',
  'APPLE_KEY_ID',
  'APPLE_PRIVATE_KEY',
];

function clearProviderEnv() {
  for (const key of PROVIDER_ENV_VARS) {
    delete process.env[key];
  }
}

function setGenericOauthEnv() {
  process.env.VALIDPOST_OAUTH_CLIENT_ID = 'oidc-id';
  process.env.VALIDPOST_OAUTH_CLIENT_SECRET = 'oidc-secret';
  process.env.VALIDPOST_OAUTH_AUTH_URL = 'https://idp.example.com/authorize';
  process.env.VALIDPOST_OAUTH_TOKEN_URL = 'https://idp.example.com/token';
  process.env.VALIDPOST_OAUTH_USERINFO_URL = 'https://idp.example.com/userinfo';
}

function makeManager(overrides: {
  kernel?: Partial<{
    latestActive: (...args: any[]) => any;
    versions: (...args: any[]) => any;
    resolveForRead: (...args: any[]) => any;
  }>;
  repo?: Partial<{ list: (...args: any[]) => any }>;
  runtimeContext?: Partial<{ build: (...args: any[]) => any }>;
}) {
  const kernel = {
    latestActive: vi.fn().mockReturnValue(undefined),
    versions: vi.fn().mockReturnValue([]),
    resolveForRead: vi.fn().mockReturnValue({
      create: vi.fn().mockReturnValue({ mocked: 'provider' }),
    }),
    ...overrides.kernel,
  };

  const repo = {
    list: vi.fn().mockResolvedValue([]),
    ...overrides.repo,
  };

  const runtimeContext = {
    build: vi.fn().mockReturnValue({ mocked: 'ctx' }),
    ...overrides.runtimeContext,
  };

  const manager = new AuthProviderManager(
    kernel as any,
    runtimeContext as any,
    repo as any
  );

  return { manager, kernel, repo, runtimeContext };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('AuthProviderManager', () => {
  describe('getProviders', () => {
    it('overlays enabled DB providers onto the env list (LOCAL always present) and drops unsupported ones', async () => {
      clearProviderEnv();
      const { manager, kernel, repo } = makeManager({
        repo: {
          list: vi.fn().mockResolvedValue([
            // Removed login providers are filtered even when enabled in the DB.
            {
              provider: 'GOOGLE',
              enabled: true,
              displayName: 'Workspace SSO',
            },
            { provider: 'GITHUB', enabled: false, displayName: null },
            { provider: 'GENERIC', enabled: true, displayName: null },
          ]),
        },
        kernel: {
          latestActive: vi.fn().mockReturnValue({
            manifest: { version: 'v2', status: 'active' },
          }),
        },
      });

      const result = await manager.getProviders();

      expect(repo.list).toHaveBeenCalled();
      expect(kernel.latestActive).toHaveBeenCalled();
      expect(result.providers).toEqual([
        { provider: 'LOCAL', displayName: 'Email', version: 'v2', status: 'active' },
        { provider: 'GENERIC', displayName: 'OIDC', version: 'v2', status: 'active' },
      ]);
    });

    it('merges DB rows with env providers: DB wins per provider, env-only providers stay listed', async () => {
      clearProviderEnv();
      process.env.VALIDPOST_GENERIC_OAUTH = 'true';
      setGenericOauthEnv();
      process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test';
      const { manager } = makeManager({
        repo: {
          list: vi.fn().mockResolvedValue([
            { provider: 'GENERIC', enabled: true, displayName: 'Company SSO' },
          ]),
        },
      });

      const result = await manager.getProviders();

      expect(result.providers).toEqual([
        { provider: 'LOCAL', displayName: 'Email', version: 'v1', status: 'active' },
        // DB row wins over the env-derived GENERIC entry (DB displayName preferred)
        { provider: 'GENERIC', displayName: 'Company SSO', version: 'v1', status: 'active' },
        // env-only provider stays listed
        { provider: 'WALLET', displayName: 'Wallet', version: 'v1', status: 'active' },
      ]);
    });

    it('falls back to LOCAL only when no DB config and no platform env credentials exist', async () => {
      clearProviderEnv();
      const { manager } = makeManager({});

      const result = await manager.getProviders();

      expect(result.providers).toEqual([
        { provider: 'LOCAL', displayName: 'Email', version: 'v1', status: 'active' },
      ]);
    });

    it('never keys on IS_GENERAL: the hosted flag without credentials still yields LOCAL only', async () => {
      clearProviderEnv();
      process.env.IS_GENERAL = 'true';
      const { manager } = makeManager({});

      const result = await manager.getProviders();

      expect(result.providers.map((p: any) => p.provider)).toEqual(['LOCAL']);
    });

    it('never advertises removed login providers, even with their env credentials present', async () => {
      clearProviderEnv();
      process.env.YOUTUBE_CLIENT_ID = 'yt-id';
      process.env.YOUTUBE_CLIENT_SECRET = 'yt-secret';
      process.env.GITHUB_CLIENT_ID = 'gh-id';
      process.env.GITHUB_CLIENT_SECRET = 'gh-secret';
      process.env.NEYNAR_CLIENT_ID = 'neynar-id';
      process.env.FACEBOOK_SSO_ENABLED = 'true';
      process.env.FACEBOOK_APP_ID = 'fb-app-id';
      process.env.FACEBOOK_APP_SECRET = 'fb-app-secret';
      process.env.X_SSO_ENABLED = 'true';
      process.env.X_CLIENT_ID = 'x-oauth2-id';
      process.env.X_CLIENT_SECRET = 'x-oauth2-secret';
      process.env.LINKEDIN_SSO_ENABLED = 'true';
      process.env.LINKEDIN_CLIENT_ID = 'li-id';
      process.env.LINKEDIN_CLIENT_SECRET = 'li-secret';
      process.env.APPLE_SSO_ENABLED = 'true';
      process.env.APPLE_CLIENT_ID = 'io.validpost.app.auth';
      process.env.APPLE_TEAM_ID = 'TEAMID1234';
      process.env.APPLE_KEY_ID = 'KEYID5678';
      process.env.APPLE_PRIVATE_KEY = 'cDx8LWtleS1iNjQ=';
      const { manager } = makeManager({});

      const result = await manager.getProviders();

      expect(result.providers.map((p: any) => p.provider)).toEqual(['LOCAL']);
    });

    it('does not advertise GENERIC when VALIDPOST_GENERIC_OAUTH is the shipped string "false"', async () => {
      clearProviderEnv();
      // .env.example ships VALIDPOST_GENERIC_OAUTH="false" — a truthy string
      // that must still disable OIDC, even with the VALIDPOST_OAUTH_* set present.
      process.env.VALIDPOST_GENERIC_OAUTH = 'false';
      setGenericOauthEnv();
      const { manager } = makeManager({});

      const result = await manager.getProviders();

      expect(result.providers.map((p: any) => p.provider)).toEqual(['LOCAL']);
    });

    it('does not advertise GENERIC when the toggle is "true" but the VALIDPOST_OAUTH_* set is incomplete', async () => {
      clearProviderEnv();
      process.env.VALIDPOST_GENERIC_OAUTH = 'true';
      process.env.VALIDPOST_OAUTH_CLIENT_ID = 'oidc-id';
      // missing VALIDPOST_OAUTH_CLIENT_SECRET / AUTH_URL / TOKEN_URL / USERINFO_URL
      const { manager } = makeManager({});

      const result = await manager.getProviders();

      expect(result.providers.map((p: any) => p.provider)).toEqual(['LOCAL']);
    });

    it('advertises GENERIC when the toggle is "true" and the full VALIDPOST_OAUTH_* set is present', async () => {
      clearProviderEnv();
      process.env.VALIDPOST_GENERIC_OAUTH = 'true';
      setGenericOauthEnv();
      const { manager } = makeManager({});

      const result = await manager.getProviders();

      expect(result.providers).toEqual([
        { provider: 'LOCAL', displayName: 'Email', version: 'v1', status: 'active' },
        { provider: 'GENERIC', displayName: 'OIDC', version: 'v1', status: 'active' },
      ]);
    });

    it('advertises WALLET when billing is enabled (STRIPE_PUBLISHABLE_KEY) and never FARCASTER', async () => {
      clearProviderEnv();
      process.env.NEYNAR_CLIENT_ID = 'neynar-id';
      process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test';
      const { manager } = makeManager({});

      const result = await manager.getProviders();

      expect(result.providers.map((p: any) => p.provider)).toEqual([
        'LOCAL',
        'WALLET',
      ]);
    });

    it('uses DEFAULT_VERSION/active when the kernel has no manifest for a provider', async () => {
      clearProviderEnv();
      process.env.VALIDPOST_GENERIC_OAUTH = 'true';
      setGenericOauthEnv();
      const { manager } = makeManager({
        kernel: {
          latestActive: vi.fn().mockReturnValue(undefined),
          versions: vi.fn().mockReturnValue([]),
        },
      });

      const result = await manager.getProviders();

      expect(result.providers).toEqual([
        { provider: 'LOCAL', displayName: 'Email', version: 'v1', status: 'active' },
        { provider: 'GENERIC', displayName: 'OIDC', version: 'v1', status: 'active' },
      ]);
    });
  });

  describe('getProvider', () => {
    it('resolves the kernel module, normalises the id to lowercase, and forwards repo + redis', () => {
      const { manager, kernel, runtimeContext, repo } = makeManager({});

      const provider = manager.getProvider('GENERIC');

      expect(kernel.resolveForRead).toHaveBeenCalledWith('auth', 'generic', 'v1');
      expect(runtimeContext.build).toHaveBeenCalledWith({
        extras: { authProviderRepo: repo, redis: expect.anything() },
      });
      expect(provider).toEqual({ mocked: 'provider' });
    });

    it('respects an explicit version', () => {
      const { manager, kernel } = makeManager({});

      manager.getProvider('GENERIC', 'v2');

      expect(kernel.resolveForRead).toHaveBeenCalledWith('auth', 'generic', 'v2');
    });
  });
});
