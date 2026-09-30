'use client';

import React from 'react';
import { StepFrame } from '@validpost/frontend/components/setup/step-frame';
import { StorageTab } from '@validpost/frontend/components/settings/storage/storage.tab';
import { useT } from '@validpost/react/translation/get.transation.service.client';

export function StepStorage() {
  const t = useT();
  return (
    <StepFrame
      title={t('setup_storage_title', 'Storage providers')}
      subtitle={t(
        'setup_storage_subtitle',
        'Local storage is enabled by default. You can mount cloud storage now or skip and configure it later in Settings.'
      )}
    >
      <StorageTab activeSubTab="providers" />
    </StepFrame>
  );
}
