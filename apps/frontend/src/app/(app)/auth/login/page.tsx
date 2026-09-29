export const dynamic = 'force-dynamic';
import { Login } from '@postmill-ai/frontend/components/auth/login';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: `ValidPost Login`,
  description: '',
};
export default async function Auth() {
  return <Login />;
}
