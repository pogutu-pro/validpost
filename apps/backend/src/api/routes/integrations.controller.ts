import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { IntegrationManager } from '@validpost/nestjs-libraries/integrations/integration.manager';
import { IntegrationService } from '@validpost/nestjs-libraries/database/prisma/integrations/integration.service';
import { GetOrgFromRequest } from '@validpost/nestjs-libraries/user/org.from.request';
import { isAllowedReturnUrl } from '@validpost/nestjs-libraries/security/return-url.validator';
import { InvalidExternalUrlError } from '@validpost/provider-kernel';
import { Organization, User, Integration } from '@prisma/client';
import { IntegrationFunctionDto } from '@validpost/nestjs-libraries/dtos/integrations/integration.function.dto';
import { CheckPolicies } from '@validpost/backend/services/auth/permissions/permissions.ability';
import { pricing } from '@validpost/nestjs-libraries/database/prisma/subscriptions/pricing';
import { mergeEffectiveLimits } from '@validpost/nestjs-libraries/database/prisma/subscriptions/effective.limits';
import { SubscriptionService } from '@validpost/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GetUserFromRequest } from '@validpost/nestjs-libraries/user/user.from.request';
import { PostsService } from '@validpost/nestjs-libraries/database/prisma/posts/posts.service';
import { CampaignsService } from '@validpost/nestjs-libraries/database/prisma/campaigns/campaigns.service';
import { ConnectProviderDto } from '@validpost/nestjs-libraries/dtos/integrations/connect-provider.dto';
import { IntegrationTimeDto } from '@validpost/nestjs-libraries/dtos/integrations/integration.time.dto';
import { PlugDto } from '@validpost/nestjs-libraries/dtos/plugs/plug.dto';

import { UpdateProviderSettingsDto } from '@validpost/nestjs-libraries/dtos/integrations/update-provider-settings.dto';
import { ChannelIdBodyDto } from '@validpost/nestjs-libraries/dtos/integrations/channel-id-body.dto';
import { PlugActivationDto } from '@validpost/nestjs-libraries/dtos/integrations/plug-activation.dto';
import { TelegramUpdatesQueryDto } from '@validpost/nestjs-libraries/dtos/integrations/telegram-updates-query.dto';
import { SetNicknameDto } from '@validpost/nestjs-libraries/dtos/integrations/set-nickname.dto';
import { ParseCuidPipe } from '@validpost/nestjs-libraries/pipes/parse-cuid.pipe';

import { TelegramProvider } from '@validpost/provider-telegram';
import { setCredentials } from '@validpost/nestjs-libraries/integrations/credentials';
import {
  AuthorizationActions,
  Sections,
} from '@validpost/backend/services/auth/permissions/permission.exception.class';

import { RefreshIntegrationService } from '@validpost/nestjs-libraries/integrations/refresh.integration.service';
import { RequirePermission } from '@validpost/backend/services/auth/rbac/require-permission.decorator';

@ApiTags('Integrations')
@Controller('/integrations')
export class IntegrationsController {
  private readonly _logger = new Logger(IntegrationsController.name);

  constructor(
    private _integrationManager: IntegrationManager,
    private _integrationService: IntegrationService,
    private _postService: PostsService,
    private _campaignsService: CampaignsService,
    private _subscriptionService: SubscriptionService
  ) {}

  @Get('/')
  // The composer's "New Channel" dialog source. Authenticated so the org's own
  // (BYO) provider configs are merged with the platform-global enabled set —
  // the pre-move no-auth variant served only the global scope.
  getIntegrations(@GetOrgFromRequest() org: Organization) {
    return this._integrationManager.getAllIntegrations(org.id);
  }

  @Post('/provider/:id/connect')
  @RequirePermission('channels', 'create')
  @CheckPolicies([AuthorizationActions.Create, Sections.CHANNEL])
  // The frontend spreads the OAuth-callback query params (provider-specific —
  // `code`, `refresh`, `device_id`, …) into this body alongside the validated
  // page-selection fields. Strip (don't reject) those extras so the global
  // `forbidNonWhitelisted: true` pipe can't 400 a legitimate connect, while
  // still bounding/validating the fields `saveProviderPage` actually reads.
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  async saveProviderPage(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: ConnectProviderDto
  ) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new Error('Invalid body');
    }
    const result = await this._integrationService.saveProviderPage(
      org.id,
      id,
      body
    );
    await this._integrationManager.invalidateIntegrationListCache(org.id);
    return result;
  }

  @Get('/:identifier/internal-plugs')
  async getInternalPlugs(@Param('identifier') identifier: string) {
    return this._integrationManager.getInternalPlugs(identifier);
  }

  @Get('/list')
  async getIntegrationList(@GetOrgFromRequest() org: Organization) {
    return this._integrationManager.getIntegrationListResponse(org.id);
  }

  @Post('/:id/settings')
  @RequirePermission('channels', 'update')
  async updateProviderSettings(
    @GetOrgFromRequest() org: Organization,
    @Param('id', ParseCuidPipe) id: string,
    @Body() body: UpdateProviderSettingsDto
  ) {
    await this._integrationService.updateProviderSettings(
      org.id,
      id,
      body.additionalSettings
    );
    await this._integrationManager.invalidateIntegrationListCache(org.id);
  }
  @Post('/:id/nickname')
  @RequirePermission('channels', 'update')
  async setNickname(
    @GetOrgFromRequest() org: Organization,
    @Param('id', ParseCuidPipe) id: string,
    @Body() body: SetNicknameDto
  ) {
    const integration = await this._integrationService.getIntegrationById(
      org.id,
      id
    );
    if (!integration) {
      throw new Error('Invalid integration');
    }

    const manager = await this._integrationManager.getSocialIntegration(
      integration.providerIdentifier,
      org.id
    );
    if (!manager.changeProfilePicture && !manager.changeNickname) {
      throw new Error('Invalid integration');
    }

    const { url } = manager.changeProfilePicture
      ? await manager.changeProfilePicture(
          integration.internalId,
          integration.token,
          body.picture
        )
      : { url: '' };

    const { name } = manager.changeNickname
      ? await manager.changeNickname(
          integration.internalId,
          integration.token,
          body.name
        )
      : { name: '' };

    const result = await this._integrationService.updateNameAndUrl(
      org.id,
      id,
      name,
      url
    );
    await this._integrationManager.invalidateIntegrationListCache(org.id);
    return result;
  }

  @Get('/social/:integration')
  @CheckPolicies([AuthorizationActions.Create, Sections.CHANNEL])
  async getIntegrationUrl(
    @Param('integration') integration: string,
    @Query('refresh') refresh: string,
    @Query('externalUrl') externalUrl: string,
    @Query('redirectUrl') redirectUrl: string,
    @Query('onboarding') onboarding: string,
    @Query('config') config: string,
    @Query('campaign') campaign: string,
    @GetOrgFromRequest() org: Organization
  ) {
    if (
      !this._integrationManager
        .getAllowedSocialsIntegrations()
        .includes(integration)
    ) {
      throw new Error('Integration not allowed');
    }

    const integrationProvider =
      await this._integrationManager.getSocialIntegration(integration, org.id);

    if (integrationProvider.externalUrl && !externalUrl) {
      throw new Error('Missing external url');
    }

    try {
      // externalUrl providers register a per-instance app dynamically, so
      // static org/env credentials are optional for them — requiring them
      // would make the dynamic flow unstartable on keyless deployments.
      // 'direct' channels (Bluesky & co.) connect with ACCOUNT credentials
      // entered in the connect form — there is no developer app, so requiring
      // org credentials would make them unconnectable (observed live: Bluesky
      // connect 500s after generateAuthUrl returns { err: true }).
      const needsAppCredentials =
        !integrationProvider.externalUrl &&
        integrationProvider.setupDescriptor?.authType !== 'direct';
      const clientInformation = needsAppCredentials
        ? await this._integrationManager.requireClientInformation(
            integration,
            org.id,
            config || undefined
          )
        : await this._integrationManager.getClientInformation(
            integration,
            org.id,
            config || undefined
          );

      // Campaign-scoped connect/invite: verify ownership before trusting the id.
      const validatedCampaign =
        campaign && (await this._campaignsService.get(campaign, org.id))
          ? campaign
          : undefined;

      if (redirectUrl && !isAllowedReturnUrl(redirectUrl)) {
        throw new Error('Invalid redirect URL');
      }

      // `await` matters: without it a rejected promise from generateAuthUrl
      // bypasses this try/catch entirely (observed as a bare 500 on an invalid
      // externalUrl).
      return await this._integrationManager.generateAuthUrl(integration, org.id, clientInformation, {
        externalUrl,
        configId: config || undefined,
        refresh,
        onboarding: onboarding === 'true',
        campaign: validatedCampaign,
        redirectUrl,
      });
    } catch (err) {
      // User-supplied instance URL failed request-shape validation → 400.
      if (err instanceof InvalidExternalUrlError) {
        throw new BadRequestException(err.message);
      }
      // Was a silent `{ err: true }` — a provider misconfig (e.g. disabled org
      // channel config, X app without a whitelisted callback) was invisible in
      // logs and undebuggable in prod. Log the cause; the response shape stays.
      this._logger.warn(
        `generateAuthUrl failed for ${integration}: ${(err as Error)?.message || err}`
      );
      return { err: true };
    }
  }

  @Post('/:id/time')
  @RequirePermission('channels', 'update')
  async setTime(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: IntegrationTimeDto
  ) {
    return this._integrationService.setTimes(org.id, id, body);
  }

  @Post('/mentions')
  @RequirePermission('channels', 'update')
  async mentions(
    @GetOrgFromRequest() org: Organization,
    @Body() body: IntegrationFunctionDto
  ) {
    return this._integrationService.getMentionsForQuery(
      org.id,
      body.id,
      body?.data?.query
    );
  }

  @Post('/function')
  @RequirePermission('channels', 'update')
  async functionIntegration(
    @GetOrgFromRequest() org: Organization,
    @Body() body: IntegrationFunctionDto
  ): Promise<any> {
    return this._integrationManager.callTool(
      org.id,
      body.id,
      body.name,
      body.data
    );
  }

  @Post('/disable')
  @RequirePermission('channels', 'update')
  async disableChannel(
    @GetOrgFromRequest() org: Organization,
    @Body() body: ChannelIdBodyDto
  ) {
    const result = await this._integrationService.disableChannel(org.id, body.id);
    await this._integrationManager.invalidateIntegrationListCache(org.id);
    return result;
  }

  @Post('/enable')
  @RequirePermission('channels', 'update')
  async enableChannel(
    @GetOrgFromRequest() org: Organization,
    @Body() body: ChannelIdBodyDto
  ) {
    // Effective channel cap: plan + channel add-ons + limitOverrides. The
    // request-scoped org.subscription select is intentionally narrow (no
    // extra*/limitOverrides), so fetch the full row; with no subscription the
    // merge returns the STARTER plan's base channel limit.
    const subscription =
      await this._subscriptionService.getSubscriptionByOrganizationId(org.id);
    const plan =
      pricing[subscription?.subscriptionTier || 'STARTER'] ?? pricing.STARTER;
    const channelLimit = mergeEffectiveLimits(plan, subscription).channel;
    const result = await this._integrationService.enableChannel(
      org.id,
      channelLimit,
      body.id
    );
    await this._integrationManager.invalidateIntegrationListCache(org.id);
    return result;
  }

  @Delete('/')
  @RequirePermission('channels', 'delete')
  async deleteChannel(
    @GetOrgFromRequest() org: Organization,
    @Body() body: ChannelIdBodyDto
  ) {
    const isTherePosts = await this._integrationService.getPostsForChannel(
      org.id,
      body.id
    );
    if (isTherePosts.length) {
      for (const post of isTherePosts) {
        this._postService.deletePost(org.id, post.group).catch((err) => {});
      }
    }

    const result = await this._integrationService.deleteChannel(org.id, body.id);
    await this._integrationManager.invalidateIntegrationListCache(org.id);
    return result;
  }

  @Get('/plug/list')
  async getPlugList() {
    return { plugs: this._integrationManager.getAllPlugs() };
  }

  @Get('/:id/plugs')
  async getPlugsByIntegrationId(
    @Param('id') id: string,
    @GetOrgFromRequest() org: Organization
  ) {
    return this._integrationService.getPlugsByIntegrationId(org.id, id);
  }

  @Post('/:id/plugs')
  @RequirePermission('channels', 'create')
  async postPlugsByIntegrationId(
    @Param('id') id: string,
    @GetOrgFromRequest() org: Organization,
    @Body() body: PlugDto
  ) {
    return this._integrationService.createOrUpdatePlug(org.id, id, body);
  }

  @Put('/plugs/:id/activate')
  @RequirePermission('channels', 'update')
  async changePlugActivation(
    @Param('id', ParseCuidPipe) id: string,
    @GetOrgFromRequest() org: Organization,
    @Body() body: PlugActivationDto
  ) {
    return this._integrationService.changePlugActivation(org.id, id, body.status);
  }

  @Get('/telegram/updates')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  async getUpdates(
    @Query() query: TelegramUpdatesQueryDto,
    @GetOrgFromRequest() org: Organization
  ) {
    try {
      // Resolve the bot token through the standard channel-credential path (org
      // BYO token wins, the platform env app is the fallback) and warm the
      // per-org credential cache the provider reads from. Telegram is
      // token-only: the bot token arrives as `token` (env app) or `client_id`
      // (org config).
      const info = await this._integrationManager.getClientInformation(
        'telegram',
        org.id
      );
      const botToken = info?.token || info?.client_id;
      if (botToken) {
        setCredentials(org.id, 'telegram', { clientId: botToken });
      }
      const provider = new TelegramProvider();
      const boundOrg = { organizationId: org.id } as Integration;
      const [updates, me] = await Promise.all([
        provider.getBotId(query, boundOrg),
        // Bot identity is best-effort display copy for the connect dialog.
        provider.getBotMe(org.id).catch(() => undefined),
      ]);
      return { ...updates, ...(me ? { bot: me } : {}) };
    } catch (err) {
      // Telegram bot not configured for this org (no org token and no platform
      // env app) or a transient getUpdates error. The frontend polls this while
      // waiting for the user's /connect message, so a 500 here just spams
      // errors — return empty so the connect flow degrades gracefully (#10).
      // The message stays in the log: an empty response is invisible
      // otherwise (observed live: repeated polls failing with zero detail).
      this._logger.warn(
        `telegram getUpdates failed; returning empty: ${(err as Error)?.message || err}`
      );
      return {};
    }
  }
}
