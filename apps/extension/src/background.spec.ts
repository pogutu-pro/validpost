import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('background message listener', () => {
  let listeners: Array<(message: unknown, sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void) => boolean | undefined> = [];
  let alarmListeners: Array<(alarm: chrome.alarms.Alarm) => void> = [];
  const storage: Record<string, unknown> = {};
  const alarms: Record<string, chrome.alarms.Alarm> = {};

  function mockChrome(): typeof chrome {
    return {
      runtime: {
        onMessageExternal: {
          addListener: (fn: typeof listeners[number]) => listeners.push(fn),
        } as unknown as typeof chrome.runtime.onMessageExternal,
      },
      cookies: {
        getAll: vi.fn(async () => []),
      } as unknown as typeof chrome.cookies,
      storage: {
        local: {
          get: vi.fn(async (key: string) => ({ [key]: storage[key] })),
          set: vi.fn(async (items: Record<string, unknown>) => {
            Object.assign(storage, items);
          }),
        },
      } as unknown as typeof chrome.storage,
      alarms: {
        get: vi.fn(async (name: string) => alarms[name] ?? undefined),
        create: vi.fn(async (name: string, alarmInfo: chrome.alarms.AlarmCreateInfo) => {
          alarms[name] = { name, scheduledTime: Date.now(), periodInMinutes: alarmInfo.periodInMinutes } as chrome.alarms.Alarm;
        }),
        clear: vi.fn(async (name: string) => {
          delete alarms[name];
          return true;
        }),
        onAlarm: {
          addListener: (fn: typeof alarmListeners[number]) => alarmListeners.push(fn),
        } as unknown as typeof chrome.alarms.onAlarm,
      },
    } as unknown as typeof chrome;
  }

  async function sendMessage(message: unknown, origin = 'https://app.validpost.io'): Promise<unknown> {
    const sender: chrome.runtime.MessageSender = { origin, url: origin };
    return new Promise((resolve, reject) => {
      let settled = false;
      const sendResponse = (response: unknown) => {
        if (!settled) {
          settled = true;
          resolve(response);
        }
      };

      const anyAsync = listeners.some((fn) => fn(message, sender, sendResponse) === true);

      if (!anyAsync) {
        // Synchronous handlers that returned a non-true value may still have
        // invoked sendResponse inside the function body (e.g. PING).
        if (!settled) {
          resolve(undefined);
        }
        return;
      }

      // Async handlers must call sendResponse within a reasonable window.
      setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error('sendResponse was not called for an async message'));
        }
      }, 500);
    });
  }

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    listeners = [];
    alarmListeners = [];
    Object.keys(storage).forEach((k) => delete storage[k]);
    Object.keys(alarms).forEach((k) => delete alarms[k]);

    vi.stubGlobal('chrome', mockChrome());

    // Importing the module registers the chrome listeners.
    await import('./background');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('responds to PING with version and ok status', async () => {
    const response = await sendMessage({ type: 'PING' });
    expect(response).toMatchObject({ status: 'ok', version: '2.0.0' });
  });

  it('rejects messages from unauthorized origins', async () => {
    const response = await sendMessage({ type: 'PING' }, 'https://evil.example.com');
    expect(response).toMatchObject({ error: 'Unauthorized origin' });
  });

  it('lists providers without cookie values', async () => {
    const response = await sendMessage({ type: 'GET_PROVIDERS' });
    expect(response).toHaveProperty('providers');
    const providers = (response as { providers: unknown[] }).providers;
    expect(Array.isArray(providers)).toBe(true);
    for (const provider of providers as Record<string, unknown>[]) {
      expect(provider).toHaveProperty('identifier');
      expect(provider).toHaveProperty('name');
      expect(provider).toHaveProperty('url');
      expect(provider).toHaveProperty('cookieNames');
    }
  });

  it('returns an unknown-provider error for an unregistered provider', async () => {
    const response = await sendMessage({ type: 'GET_COOKIES', provider: 'no-such-provider' });
    expect(response).toMatchObject({
      success: false,
      error: 'Unknown provider: no-such-provider',
    });
  });

  it('stores and removes refresh tokens', async () => {
    const storeResponse = await sendMessage({
      type: 'STORE_REFRESH_TOKEN',
      provider: 'example',
      integrationId: 'integration-1',
      jwt: 'jwt-token',
      backendUrl: 'https://api.example.com',
    });
    expect(storeResponse).toMatchObject({ success: true });
    expect(storage['refreshEntries']).toHaveProperty('integration-1');

    const removeResponse = await sendMessage({
      type: 'REMOVE_REFRESH_TOKEN',
      integrationId: 'integration-1',
    });
    expect(removeResponse).toMatchObject({ success: true });
    expect(storage['refreshEntries']).not.toHaveProperty('integration-1');
  });
});
