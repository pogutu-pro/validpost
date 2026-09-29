import { CookieProvider } from './cookie-provider.interface';

// No cookie-extraction providers are bundled any more — the previous Chrome-
// extension-only channel was removed. The framework is kept so a future
// cookie-based provider can be dropped into `list/` and registered here.
export const providers: CookieProvider[] = [];

const providerMap = new Map<string, CookieProvider>(
  providers.map((p) => [p.identifier, p])
);

export function getAllProviders(): CookieProvider[] {
  return providers;
}

export function getProvider(identifier: string): CookieProvider | undefined {
  return providerMap.get(identifier);
}
