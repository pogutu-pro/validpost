'use client';

import dynamic from 'next/dynamic';

const HiggsfieldStudio = dynamic(
  () => import('@validpost/frontend/components/media-tools/higgsfield/higgsfield-studio').then((m) => m.HiggsfieldStudio),
  { ssr: false }
);

export default function HiggsfieldPage() {
  return <HiggsfieldStudio />;
}
