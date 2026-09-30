import { describe, it, expect } from 'vitest';
import { ShortLinkAdapter } from '@validpost/nestjs-libraries/short-linking/short-link.interface';
import bitlyModules from '@validpost/provider-bitly';
import blinkModules from '@validpost/provider-blink';
import cleanuriModules from '@validpost/provider-cleanuri';
import cuttlyModules from '@validpost/provider-cuttly';
import dubModules from '@validpost/provider-dub';
import isgdModules from '@validpost/provider-isgd';
import linklyModules from '@validpost/provider-linkly';
import owlyModules from '@validpost/provider-owly';
import pixelmeModules from '@validpost/provider-pixelme';
import rebrandlyModules from '@validpost/provider-rebrandly';
import replugModules from '@validpost/provider-replug';
import shortioModules from '@validpost/provider-shortio';
import sniplyModules from '@validpost/provider-sniply';
import switchyModules from '@validpost/provider-switchy';
import t2mModules from '@validpost/provider-t2m';
import tinyccModules from '@validpost/provider-tinycc';
import tinyurlModules from '@validpost/provider-tinyurl';
import tlyModules from '@validpost/provider-tly';
import vgdModules from '@validpost/provider-vgd';

// Each relocated short-link package module is built into a real adapter instance
// (the same modules ProvidersBootstrap registers into the kernel). These are the
// documented capability counts that used to live next to the in-tree adapters.
const shortlinkModules = [
  ...bitlyModules,
  ...blinkModules,
  ...cleanuriModules,
  ...cuttlyModules,
  ...dubModules,
  ...isgdModules,
  ...linklyModules,
  ...owlyModules,
  ...pixelmeModules,
  ...rebrandlyModules,
  ...replugModules,
  ...shortioModules,
  ...sniplyModules,
  ...switchyModules,
  ...t2mModules,
  ...tinyccModules,
  ...tinyurlModules,
  ...tlyModules,
  ...vgdModules,
].filter((m) => m.manifest.domain === 'shortlink');

describe('Short-link provider capabilities (documented counts)', () => {
  const stubFetch = (async () => new Response()) as unknown as typeof fetch;

  const adapters: ShortLinkAdapter[] = shortlinkModules.map(
    (mod) => mod.create({ fetch: stubFetch } as any) as ShortLinkAdapter,
  );

  it('has exactly 19 registered adapters', () => {
    expect(adapters).toHaveLength(19);
  });

  it('has exactly 10 adapters with statistics: true', () => {
    const withStats = adapters.filter((a) => a.capabilities.statistics);
    expect(withStats).toHaveLength(10);
  });

  it('has exactly 13 adapters with customDomain: true', () => {
    const withCustomDomain = adapters.filter((a) => a.capabilities.customDomain);
    expect(withCustomDomain).toHaveLength(13);
  });
});
