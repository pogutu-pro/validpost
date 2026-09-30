export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { Activate } from '@validpost/frontend/components/auth/activate';
export const metadata: Metadata = {
  title: `ValidPost - Activate your account`,
  description: '',
};
export default async function Auth() {
  return <Activate />;
}
