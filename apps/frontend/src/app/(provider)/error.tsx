'use client';

import { RouteError } from '@validpost/frontend/components/errors/route-error';

export default function ProviderError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} />;
}
