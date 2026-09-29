export const dynamic = 'force-dynamic';
import { LaunchesComponent } from '@postmill-ai/frontend/components/launches/launches.component';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: `ValidPost Posts`,
  description: '',
};
export default async function Index() {
  return <LaunchesComponent />;
}
