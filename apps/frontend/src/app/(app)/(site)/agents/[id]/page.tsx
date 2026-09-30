import { Metadata } from 'next';
import { Agent } from '@validpost/frontend/components/agents/agent';
import { AgentChat } from '@validpost/frontend/components/agents/agent.chat';
export const metadata: Metadata = {
  title: 'ValidPost - Agent',
  description: '',
};
export default async function Page() {
  return (
    <AgentChat />
  );
}
