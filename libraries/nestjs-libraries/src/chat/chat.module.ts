import { Global, Module } from '@nestjs/common';
import { LoadToolsService } from '@validpost/nestjs-libraries/chat/load.tools.service';
import { MastraService } from '@validpost/nestjs-libraries/chat/mastra.service';
import { toolList } from '@validpost/nestjs-libraries/chat/tools/tool.list';
import { ContentAgentBuilder } from '@validpost/nestjs-libraries/chat/agents/content.agent';
import { MediaAgentBuilder } from '@validpost/nestjs-libraries/chat/agents/media.agent';
import { AnalyticsAgentBuilder } from '@validpost/nestjs-libraries/chat/agents/analytics.agent';
import { OpsAgentBuilder } from '@validpost/nestjs-libraries/chat/agents/ops.agent';
import { ContentPipelineModule } from '@validpost/nestjs-libraries/chat/content-pipeline/content-pipeline.module';
import { CommsConfirmationGate } from '@validpost/nestjs-libraries/chat/tools/comms-confirmation.gate';

@Global()
@Module({
  imports: [ContentPipelineModule],
  providers: [
    MastraService,
    LoadToolsService,
    ContentAgentBuilder,
    MediaAgentBuilder,
    AnalyticsAgentBuilder,
    OpsAgentBuilder,
    CommsConfirmationGate,
    ...toolList,
  ],
  get exports() {
    return this.providers;
  },
})
export class ChatModule {}
