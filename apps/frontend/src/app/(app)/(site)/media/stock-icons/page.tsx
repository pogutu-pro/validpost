'use client';

import dynamic from 'next/dynamic';

const StockIcons = dynamic(
  () =>
    import('@validpost/frontend/components/media-tools/stock-icons').then(
      (m) => m.StockIcons
    ),
  { ssr: false }
);

export default function StockIconsPage() {
  return <StockIcons />;
}
