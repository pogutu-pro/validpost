'use client';

import dynamic from 'next/dynamic';

const DeepgramStudio = dynamic(
  () => import('@validpost/frontend/components/media-tools/deepgram/deepgram-studio').then((m) => m.DeepgramStudio),
  { ssr: false }
);

export default function DeepgramPage() {
  return <DeepgramStudio />;
}
