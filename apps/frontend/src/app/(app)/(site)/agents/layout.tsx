import { Metadata } from 'next';
import { Agent } from '@postmill-ai/frontend/components/agents/agent';
export const metadata: Metadata = {
  title: 'ValidPost - Agent',
  description: 'agents',
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Agent>{children}</Agent>;
}
