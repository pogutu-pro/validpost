'use client';

import dynamic from 'next/dynamic';

const HedraStudio = dynamic(
  () => import('@validpost/frontend/components/media-tools/hedra/hedra-studio').then((m) => m.HedraStudio),
  { ssr: false }
);

export default function HedraPage() {
  return <HedraStudio />;
}
