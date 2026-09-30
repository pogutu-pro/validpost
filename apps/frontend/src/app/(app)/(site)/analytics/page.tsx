export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { AnalyticsDashboard } from '@validpost/frontend/components/analytics/analytics.dashboard';

export const metadata: Metadata = {
  title: `Analytics`,
  description: '',
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
