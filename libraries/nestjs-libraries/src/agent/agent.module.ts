import { Global, Module } from '@nestjs/common';
import { AgentGraphService } from '@validpost/nestjs-libraries/agent/agent.graph.service';

@Global()
@Module({
  providers: [AgentGraphService],
  get exports() {
    return this.providers;
  },
})
export class AgentModule {}
