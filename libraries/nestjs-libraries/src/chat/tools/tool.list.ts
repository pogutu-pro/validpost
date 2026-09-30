import { IntegrationValidationTool } from '@validpost/nestjs-libraries/chat/tools/integration.validation.tool';
import { IntegrationTriggerTool } from '@validpost/nestjs-libraries/chat/tools/integration.trigger.tool';
import { IntegrationSchedulePostTool } from './integration.schedule.post';
import { GenerateVideoTool } from '@validpost/nestjs-libraries/chat/tools/generate.video.tool';
import { GenerateImageTool } from '@validpost/nestjs-libraries/chat/tools/generate.image.tool';
import { IntegrationListTool } from '@validpost/nestjs-libraries/chat/tools/integration.list.tool';
import { UploadFromUrlTool } from '@validpost/nestjs-libraries/chat/tools/upload.from.url.tool';
import { DesignerDesignTool } from '@validpost/nestjs-libraries/chat/tools/designer.design.tool';

// Phase 1 capability tools
import { AnalyticsOverviewTool } from '@validpost/nestjs-libraries/chat/tools/analytics.overview.tool';
import { AnalyticsBestTimeTool } from '@validpost/nestjs-libraries/chat/tools/analytics.best-time.tool';
import { AnalyticsRecommendationsTool } from '@validpost/nestjs-libraries/chat/tools/analytics.recommendations.tool';
import { AnalyticsPostTool } from '@validpost/nestjs-libraries/chat/tools/analytics.post.tool';
import { AnalyticsWatchlistTool } from '@validpost/nestjs-libraries/chat/tools/analytics.watchlist.tool';
import { ListMediaProvidersTool } from '@validpost/nestjs-libraries/chat/tools/media.providers.tool';
import { ListMediaModelsTool } from '@validpost/nestjs-libraries/chat/tools/media.models.tool';
import { MediaStudioGenerateTool } from '@validpost/nestjs-libraries/chat/tools/media.studio.generate.tool';
import { MediaJobStatusTool } from '@validpost/nestjs-libraries/chat/tools/media.job.status.tool';
import { CampaignCreateTool } from '@validpost/nestjs-libraries/chat/tools/campaign.create.tool';
import { CampaignUpdateTool } from '@validpost/nestjs-libraries/chat/tools/campaign.update.tool';
import { CampaignDashboardTool } from '@validpost/nestjs-libraries/chat/tools/campaign.dashboard.tool';
import { CampaignTagTool } from '@validpost/nestjs-libraries/chat/tools/campaign.tag.tool';
import { CommentsInboxTool } from '@validpost/nestjs-libraries/chat/tools/comments.inbox.tool';
import { CommentReplyTool } from '@validpost/nestjs-libraries/chat/tools/comments.reply.tool';
import { GenerateContentTool } from '@validpost/nestjs-libraries/chat/tools/generate.content.tool';
import { RunGeneratorTool } from '@validpost/nestjs-libraries/chat/tools/run.generator.tool';
import { RunContentPipelineTool } from '@validpost/nestjs-libraries/chat/tools/run.content.pipeline.tool';
import { PostsListTool } from '@validpost/nestjs-libraries/chat/tools/posts.list.tool';
import { PostsGetTool } from '@validpost/nestjs-libraries/chat/tools/posts.get.tool';
import { PostsRescheduleTool } from '@validpost/nestjs-libraries/chat/tools/posts.reschedule.tool';
import { PostsDeleteTool } from '@validpost/nestjs-libraries/chat/tools/posts.delete.tool';
import { PostsApproveTool } from '@validpost/nestjs-libraries/chat/tools/posts.approve.tool';
import { FilesSearchTool } from '@validpost/nestjs-libraries/chat/tools/files.search.tool';
import { StockSearchTool } from '@validpost/nestjs-libraries/chat/tools/stock.search.tool';
import { RagSearchTool } from '@validpost/nestjs-libraries/chat/tools/rag.search.tool';
import { BrandMemorySearchTool } from '@validpost/nestjs-libraries/chat/tools/brand.memory.search.tool';
import { BrandProfileTool } from '@validpost/nestjs-libraries/chat/tools/brand.profile.tool';
import { BrandMemoryReindexTool } from '@validpost/nestjs-libraries/chat/tools/brand.memory.reindex.tool';

export const toolList = [
  // Existing tools
  IntegrationListTool,
  IntegrationValidationTool,
  IntegrationTriggerTool,
  IntegrationSchedulePostTool,
  GenerateVideoTool,
  GenerateImageTool,
  UploadFromUrlTool,
  DesignerDesignTool,

  // Phase 1: analytics
  AnalyticsOverviewTool,
  AnalyticsBestTimeTool,
  AnalyticsRecommendationsTool,
  AnalyticsPostTool,
  AnalyticsWatchlistTool,

  // Phase 1: media studios
  ListMediaProvidersTool,
  ListMediaModelsTool,
  MediaStudioGenerateTool,
  MediaJobStatusTool,

  // Phase 1: campaigns
  CampaignCreateTool,
  CampaignUpdateTool,
  CampaignDashboardTool,
  CampaignTagTool,

  // Phase 1: comments
  CommentsInboxTool,
  CommentReplyTool,

  // Phase 1: content
  GenerateContentTool,
  RunGeneratorTool,
  RunContentPipelineTool,

  // Phase 2: memory / brand / RAG
  RagSearchTool,
  BrandMemorySearchTool,
  BrandProfileTool,
  BrandMemoryReindexTool,

  // Phase 1: posts/calendar
  PostsListTool,
  PostsGetTool,
  PostsRescheduleTool,
  PostsDeleteTool,
  PostsApproveTool,

  // Phase 1: files & stock
  FilesSearchTool,
  StockSearchTool,
];
