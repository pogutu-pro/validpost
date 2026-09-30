import { Metadata } from 'next';
import { DashboardComponent } from '@validpost/frontend/components/dashboard/dashboard.component';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'ValidPost Dashboard',
};

export default function DashboardPage() {
  return <DashboardComponent />;
}
