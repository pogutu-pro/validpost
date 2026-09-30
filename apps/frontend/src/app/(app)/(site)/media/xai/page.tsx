'use client';

import dynamic from 'next/dynamic';

const XaiStudio = dynamic(
  () => import('@validpost/frontend/components/media-tools/xai/xai-studio').then((m) => m.XaiStudio),
  { ssr: false }
);

export default function XaiPage() {
  return <XaiStudio />;
}
