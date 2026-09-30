'use client';

import dynamic from 'next/dynamic';

const MinimaxStudio = dynamic(
  () => import('@validpost/frontend/components/media-tools/minimax/minimax-studio').then((m) => m.MinimaxStudio),
  { ssr: false }
);

export default function MinimaxPage() {
  return <MinimaxStudio />;
}
