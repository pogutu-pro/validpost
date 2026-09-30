'use client';

import dynamic from 'next/dynamic';

const OpenRouterStudio = dynamic(
  () => import('@validpost/frontend/components/media-tools/openrouter/openrouter-studio').then((m) => m.OpenRouterStudio),
  { ssr: false }
);

export default function OpenRouterPage() {
  return <OpenRouterStudio />;
}
