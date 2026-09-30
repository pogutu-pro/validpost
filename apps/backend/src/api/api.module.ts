import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthController } from '@validpost/backend/api/routes/auth.controller';
import { AuthService } from '@validpost/backend/services/auth/auth.service';
import { UsersController } from '@validpost/backend/api/routes/users.controller';
import { AuthMiddleware } from '@validpost/backend/services/auth/auth.middleware';
import { AuthGuard } from '@validpost/backend/services/auth/auth.guard';
import { CsrfMiddleware } from '@validpost/backend/services/auth/csrf.middleware';
import { StripeController } from '@validpost/backend/api/routes/stripe.controller';
import { PaymentsWebhooksController } from '@validpost/backend/api/routes/payments.webhooks.controller';
import { AnalyticsService } from '@validpost/nestjs-libraries/analytics/analytics.service';
import { AnalyticsLiveFallbackService } from '@validpost/nestjs-libraries/analytics/analytics-live-fallback';
import { AnalyticsOverviewService } from '@validpost/nestjs-libraries/analytics/analytics-overview.service';
import { AnalyticsDetailService } from '@validpost/nestjs-libraries/analytics/analytics-detail.service';
import { AnalyticsInsightsService } from '@validpost/nestjs-libraries/analytics/analytics-insights.service';
import { AnalyticsExportService } from '@validpost/nestjs-libraries/analytics/analytics-export.service';
import { AnalyticsShareService } from '@validpost/nestjs-libraries/analytics/analytics-share.service';
import { MediaStreamService } from '@validpost/nestjs-libraries/media/stream/media-stream.service';
import { PoliciesGuard } from '@validpost/backend/services/auth/permissions/permissions.guard';
import { PermissionsService } from '@validpost/backend/services/auth/permissions/permissions.service';
import { IntegrationsController } from '@validpost/backend/api/routes/integrations.controller';
import { IntegrationManager } from '@validpost/nestjs-libraries/integrations/integration.manager';
import { SettingsController } from '@validpost/backend/api/routes/settings.controller';
import { SetupController } from '@validpost/backend/api/routes/setup.controller';
import { OrganizationsController } from '@validpost/backend/api/routes/organizations.controller';
import { PostsController } from '@validpost/backend/api/routes/posts.controller';
import { MediaController } from '@validpost/backend/api/routes/media.controller';
import { FilesController } from '@validpost/backend/api/routes/files.controller';
import { UploadModule } from '@validpost/nestjs-libraries/upload/upload.module';
import { BillingController } from '@validpost/backend/api/routes/billing.controller';
import { NotificationsController } from '@validpost/backend/api/routes/notifications.controller';
import { AdminNotificationsController } from '@validpost/backend/api/routes/admin-notifications.controller';
import { OpenaiService } from '@validpost/nestjs-libraries/openai/openai.service';
import { ExtractContentService } from '@validpost/nestjs-libraries/openai/extract.content.service';
import { CodesService } from '@validpost/nestjs-libraries/services/codes.service';
import { CopilotController } from '@validpost/backend/api/routes/copilot.controller';
import { PublicController } from '@validpost/backend/api/routes/public.controller';
import { RootController } from '@validpost/backend/api/routes/root.controller';
import { TrackService } from '@validpost/nestjs-libraries/track/track.service';
import { ShortLinkService } from '@validpost/nestjs-libraries/short-linking/short.link.service';
import { WebhookController } from '@validpost/backend/api/routes/webhooks.controller';
import { SignatureController } from '@validpost/backend/api/routes/signature.controller';
import { AutopostController } from '@validpost/backend/api/routes/autopost.controller';
import { SetsController } from '@validpost/backend/api/routes/sets.controller';
import { MonitorController } from '@validpost/backend/api/routes/monitor.controller';
import { NoAuthIntegrationsController } from '@validpost/backend/api/routes/no.auth.integrations.controller';
import { EnterpriseController } from '@validpost/backend/api/routes/enterprise.controller';
import { OAuthAppController } from '@validpost/backend/api/routes/oauth-app.controller';
import { ApprovedAppsController } from '@validpost/backend/api/routes/approved-apps.controller';
import { OAuthController, OAuthAuthorizedController } from '@validpost/backend/api/routes/oauth.controller';
import {
  FederationController,
  FederationAuthorizedController,
  FederationDiscoveryController,
} from '@validpost/backend/api/routes/federation.controller';
import { AnnouncementsController } from '@validpost/backend/api/routes/announcements.controller';
import { ChannelConfigPerTenantController } from '@validpost/backend/api/routes/channel-config.per-tenant.controller';
import { SocialCommentsController } from '@validpost/backend/api/routes/social-comments.controller';
import { AiSettingsController } from '@validpost/backend/api/routes/ai-settings.controller';
import { AdminDefaultsController } from '@validpost/backend/api/routes/admin-defaults.controller';
import { AiModerateController } from '@validpost/backend/api/routes/ai-moderate.controller';
import { AiUserController } from '@validpost/backend/api/routes/ai-user.controller';
import { CampaignsController } from '@validpost/backend/api/routes/campaigns.controller';
import { RagController } from '@validpost/backend/api/routes/rag.controller';
import { StorageController } from '@validpost/backend/api/routes/storage.controller';
import { OrgAiSettingsController } from '@validpost/backend/api/routes/org-ai-settings.controller';
import { OrgShortLinkSettingsController } from '@validpost/backend/api/routes/org-shortlink-settings.controller';
import { OrgVpnSettingsController } from '@validpost/backend/api/routes/org-vpn-settings.controller';
import { ContentPackController } from '@validpost/backend/api/routes/content-pack.controller';
import { MediaProviderController } from '@validpost/backend/api/routes/media-provider.controller';
import { MediaDefaultsController } from '@validpost/backend/api/routes/media-defaults.controller';
import { DashboardController } from '@validpost/backend/api/routes/dashboard.controller';
import { BrandsController } from '@validpost/backend/api/routes/brands.controller';
import { ApiKeysController } from '@validpost/backend/api/routes/api-keys.controller';
import { RolesController } from '@validpost/backend/api/routes/roles.controller';
import { StockMediaController } from '@validpost/backend/api/routes/stock-media.controller';
import { StockMediaService } from '@validpost/nestjs-libraries/media/stock/stock-media.service';
import { DesignController, DesignRenderFrameController, DesignTemplateController, DesignerProxyController } from '@validpost/backend/api/routes/design.controller';
import { EmailWebhooksController } from '@validpost/backend/api/routes/email-webhooks.controller';
import { MediaJobsWebhookController } from '@validpost/backend/api/routes/media-jobs-webhook.controller';
import { AiGuardMiddleware } from '@validpost/backend/services/ai/ai-guard.middleware';
import { AuthProviderManager } from '@validpost/backend/services/auth/providers/auth-provider.manager';
import { ProvidersManager } from '@validpost/backend/services/auth/providers/providers.manager';
import { OrgRbacGuard } from '@validpost/backend/services/auth/rbac/org-rbac.guard';
import { SessionCleanupService } from '@validpost/backend/services/session-cleanup.service';
import { HealthController } from '@validpost/backend/api/routes/health.controller';
import { HealthService } from '@validpost/backend/services/health.service';
import {
  ProvidersController,
  AdminProvidersController,
} from '@validpost/backend/api/routes/providers.controller';
import { AdminOrgsController } from '@validpost/backend/api/routes/admin.orgs.controller';
import { InngestModule } from '@validpost/nestjs-libraries/inngest/inngest.module';
import { ReplicateStudioModule } from '@validpost/nestjs-libraries/media/replicate-studio/replicate-studio.module';
import { ReplicateStudioController } from './routes/replicate-studio.controller';
import { HeyGenModule } from '@validpost/nestjs-libraries/media/heygen/heygen.module';
import { HeyGenController } from './routes/heygen.controller';
import { MediaStudioModule } from '@validpost/nestjs-libraries/media/studio/studio.module';
import { MediaStudioController } from './routes/media-studio.controller';
import { DeepgramModule } from '@validpost/nestjs-libraries/media/deepgram/deepgram.module';
import { DeepgramController } from './routes/deepgram.controller';
import { AiDesignerModule } from '@validpost/nestjs-libraries/ai-designer/ai-designer.module';
import { AiDesignerController } from './routes/ai-designer.controller';
import { AiDesignerGateway } from './gateways/ai-designer.gateway';
import { CommsSettingsController } from './routes/comms-settings.controller';
import { CommsWebhooksController } from './routes/comms-webhooks.controller';
import { MetaCallbacksController } from './routes/meta-callbacks.controller';
import { PublicCatalogController } from './routes/public-catalog.controller';

// Exported so tests can prove a controller is registered for
// AuthMiddleware/CsrfMiddleware (an unregistered controller serves unauthenticated).
export const authenticatedController = [
  UsersController,
  IntegrationsController,
  SettingsController,
  SetupController,
  OrganizationsController,
  SocialCommentsController,
  CampaignsController,
  PostsController,
  MediaController,
  FilesController,
  BillingController,
  NotificationsController,
  AdminNotificationsController,
  CopilotController,
  WebhookController,
  SignatureController,
  AutopostController,
  SetsController,
  OAuthAppController,
  ApprovedAppsController,
  OAuthAuthorizedController,
  FederationAuthorizedController,
  AnnouncementsController,
  AiSettingsController,
  AdminDefaultsController,
  AiModerateController,
  AiUserController,
  StorageController,
  ChannelConfigPerTenantController,
  OrgAiSettingsController,
  RagController,
  OrgShortLinkSettingsController,
  OrgVpnSettingsController,
  CommsSettingsController,
  ContentPackController,
  MediaProviderController,
  MediaDefaultsController,
  ApiKeysController,
  DashboardController,
  BrandsController,
  RolesController,
  StockMediaController,
  DesignController,
  DesignTemplateController,
  DesignerProxyController,
  ReplicateStudioController,
  HeyGenController,
  MediaStudioController,
  DeepgramController,
  AiDesignerController,
  AdminProvidersController,
  AdminOrgsController,
  // PROVIDER_REMEDIATION 3.1: `/providers/catalog` was fully anonymous. It is
  // org-agnostic but must be authenticated — it fingerprints the deployment's exact
  // release + the `verified:false` beta cohort. Moved into the authenticated group so
  // AuthMiddleware/CsrfMiddleware apply (still no org-scoping in the handler).
  ProvidersController,
];
@Module({
  imports: [UploadModule, InngestModule, ReplicateStudioModule, HeyGenModule, MediaStudioModule, DeepgramModule, AiDesignerModule],
  controllers: [
    RootController,
    HealthController,
    StripeController,
    PaymentsWebhooksController,
    AuthController,
    PublicController,
    MonitorController,
    EnterpriseController,
    NoAuthIntegrationsController,
    OAuthController,
    FederationController,
    FederationDiscoveryController,
    EmailWebhooksController,
    MediaJobsWebhookController,
    CommsWebhooksController,
    MetaCallbacksController,
    PublicCatalogController,
    DesignRenderFrameController,
    ...authenticatedController,
  ],
  providers: [
    AuthService,
    OpenaiService,
    ExtractContentService,
    AuthMiddleware,
    AuthGuard,
    PoliciesGuard,
    OrgRbacGuard,
    PermissionsService,
    CodesService,
    IntegrationManager,
    TrackService,
    ShortLinkService,
    AuthProviderManager,
    ProvidersManager,
    AnalyticsService,
    AnalyticsLiveFallbackService,
    AnalyticsOverviewService,
    AnalyticsDetailService,
    AnalyticsInsightsService,
    AnalyticsExportService,
    AnalyticsShareService,
    StockMediaService,
    AiGuardMiddleware,
    SessionCleanupService,
    HealthService,
    AiDesignerGateway,
    MediaStreamService,
  ],
  get exports() {
    return [...this.imports, ...this.providers];
  },
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(...authenticatedController);
    consumer.apply(CsrfMiddleware).forRoutes(...authenticatedController);
    // path-to-regexp v8 (Express 5 / Nest 11) requires named wildcards; bare `*`
    // throws "Missing parameter name". `{/*splat}` matches both the bare path and
    // everything under it (e.g. /agents and /agents/list).
    consumer
      .apply(AiGuardMiddleware)
      .forRoutes({ path: '/copilot/chat', method: RequestMethod.POST });
    consumer
      .apply(AiGuardMiddleware)
      .forRoutes({ path: '/copilot/agent', method: RequestMethod.POST });
  }
}
