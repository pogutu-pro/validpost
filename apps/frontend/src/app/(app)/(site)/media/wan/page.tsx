'use client';

import dynamic from 'next/dynamic';

const WanStudio = dynamic(
  () => import('@validpost/frontend/components/media-tools/wan/wan-studio').then((m) => m.WanStudio),
  { ssr: false }
);

export default function WanPage() {
  return <WanStudio />;
}
