export const dynamic = 'force-dynamic';
import { Login } from '@validpost/frontend/components/auth/login';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: `ValidPost Login`,
  description: '',
};
export default async function Auth() {
  return <Login />;
}
