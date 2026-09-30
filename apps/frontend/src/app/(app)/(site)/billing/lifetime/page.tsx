import { LifetimeDeal } from '@validpost/frontend/components/billing/lifetime.deal';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: `ValidPost Lifetime deal`,
  description: '',
};
export default async function Page() {
  return <LifetimeDeal />;
}
