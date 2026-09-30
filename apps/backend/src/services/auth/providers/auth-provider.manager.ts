import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuthProviderAbstract } from '@validpost/backend/services/auth/providers.interface';
import {
  ProviderKernel,
  DEFAULT_VERSION,
} from '@validpost/provider-kernel';
import { PROVIDER_KERNEL } from '@validpost/nestjs-libraries/providers/providers.module';
import { RuntimeContextFactory } from '@validpost/nestjs-libraries/providers/runtime-context.factory';
import { AuthProviderRepository } from '@validpost/nestjs-libraries/database/prisma/auth-providers/auth-provider.repository';
import { ioRedis } from '@validpost/nestjs-libraries/redis/redis.service';
import { billingEnabled } from '@validpost/helpers/billing/payments.env';

/**
 * The login providers this deployment supports. Everything else (GitHub,
 * Google, Facebook, X, LinkedIn, Apple, Farcaster, …) was removed, so it is
 * neither advertised on the login page nor resolvable as an adapter.
 *
 * The Prisma `Provider` enum still carries the removed values — dropping enum
 * values would need a migration story for existing `AuthProviderConfig` rows —
 * so this allowlist is the enforcement point.
 */
export const SUPPORTED_AUTH_PROVIDERS = ['LOCAL', 'GENERIC', 'WALLET'] as const;

@Injectable()
export class AuthProviderManager {
  constructor(
    @Inject(PROVIDER_KERNEL) private _kernel: ProviderKernel,
    private _runtimeContext: RuntimeContextFactory,
    private _authProviderRepo: AuthProviderRepository
  ) {}

  // Latest-active kernel version + status for an auth provider. Degrades to
  // v1/active when the auth domain has no kernel module registered for this
  // provider yet.
  private _versionInfo(provider: string): {
    version: string;
    status: string;
  } {
    const providerId = provider.toLowerCase();
    const latest = this._kernel.latestActive('auth', providerId);
    if (latest) {
      return {
        version: latest.manifest.version,
        status: latest.manifest.status,
      };
    }
    const manifests = this._kernel.versions('auth', providerId);
    if (manifests.length > 0) {
      const manifest = manifests[manifests.length - 1];
      return { version: manifest.version, status: manifest.status };
    }
    return { version: DEFAULT_VERSION, status: 'active' };
  }

  /**
   * Compose the public list of enabled login providers.
   *
   * LOCAL is always present. The env-derived list advertises a provider only
   * when its full env credential set is actually present, so the login page
   * never advertises a provider whose adapter cannot resolve. Enabled
   * DB-backed configs (AuthProviderConfig) are then overlaid: DB wins per
   * provider key (DB displayName preferred), while env-only providers stay
   * listed. Providers outside SUPPORTED_AUTH_PROVIDERS are filtered out.
   */
  async getProviders() {
    const dbProviders = await this._authProviderRepo.list();
    const enabledFromDb = dbProviders.filter(
      (p) =>
        p.enabled &&
        (SUPPORTED_AUTH_PROVIDERS as readonly string[]).includes(p.provider)
    );

    const providers: {
      provider: string;
      displayName: string;
      version: string;
      status: string;
    }[] = [
      { provider: 'LOCAL', displayName: 'Email', ...this._versionInfo('LOCAL') },
    ];

    // Mirror the adapters' env resolution
    // (libraries/providers/generic/src/v1/auth.adapter.ts): a provider is
    // offered only when the complete env credential set its resolver requires
    // is present. Never key on IS_GENERAL — that flag marks the hosted build,
    // not whether a provider is configured at the platform level.
    if (
      process.env.VALIDPOST_GENERIC_OAUTH === 'true' &&
      process.env.VALIDPOST_OAUTH_CLIENT_ID &&
      process.env.VALIDPOST_OAUTH_CLIENT_SECRET &&
      process.env.VALIDPOST_OAUTH_AUTH_URL &&
      process.env.VALIDPOST_OAUTH_TOKEN_URL &&
      process.env.VALIDPOST_OAUTH_USERINFO_URL
    ) {
      providers.push({
        provider: 'GENERIC',
        displayName:
          process.env.NEXT_PUBLIC_VALIDPOST_OAUTH_DISPLAY_NAME || 'OIDC',
        ...this._versionInfo('GENERIC'),
      });
    }

    // NOTE: Wallet's env gate is a billing var, not a wallet-auth config —
    // known misalignment, out of scope for the phantom-provider fix.
    if (billingEnabled()) {
      providers.push({
        provider: 'WALLET',
        displayName: 'Wallet',
        ...this._versionInfo('WALLET'),
      });
    }

    // Overlay enabled DB-backed configs: DB wins per provider key (DB
    // displayName preferred), env-only providers stay listed.
    for (const p of enabledFromDb) {
      const entry = {
        provider: p.provider,
        displayName:
          p.displayName ||
          (p.provider === 'GENERIC'
            ? process.env.NEXT_PUBLIC_VALIDPOST_OAUTH_DISPLAY_NAME || 'OIDC'
            : p.provider.charAt(0) + p.provider.slice(1).toLowerCase()),
        ...this._versionInfo(p.provider),
      };
      const existing = providers.findIndex((e) => e.provider === p.provider);
      if (existing > -1) {
        providers[existing] = entry;
      } else {
        providers.push(entry);
      }
    }

    return { providers };
  }

  /**
   * Resolve an auth provider adapter from the kernel.
   *
   * The AuthProviderRepository is forwarded via ctx.extras so package adapters
   * can preserve the DB-config-first -> env-fallback credential precedence;
   * ioRedis is forwarded for adapters that need it (e.g. the wallet nonce store).
   *
   * Providers outside SUPPORTED_AUTH_PROVIDERS are rejected so a stale
   * `AuthProviderConfig` row or an old client cannot resurrect a removed login
   * method.
   */
  getProvider(provider: string, version?: string): AuthProviderAbstract {
    if (!(SUPPORTED_AUTH_PROVIDERS as readonly string[]).includes(provider)) {
      throw new NotFoundException(
        `Auth provider ${provider} is not supported`,
      );
    }
    const resolvedVersion = version ?? DEFAULT_VERSION;
    // Kernel provider ids are lowercase; callers pass the uppercase Prisma
    // Provider enum (e.g. GENERIC), so normalise before kernel lookups.
    const providerId = provider.toLowerCase();

    const mod = this._kernel.resolveForRead(
      'auth',
      providerId,
      resolvedVersion
    );
    const ctx = this._runtimeContext.build({
      extras: { authProviderRepo: this._authProviderRepo, redis: ioRedis },
    });
    return mod.create(ctx) as unknown as AuthProviderAbstract;
  }
}
