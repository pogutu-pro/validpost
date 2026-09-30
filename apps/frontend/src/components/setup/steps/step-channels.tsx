'use client';

import React from 'react';
import { StepFrame } from '@validpost/frontend/components/setup/step-frame';
import { ChannelsTab } from '@validpost/frontend/components/settings/channels/channels.tab';
import { useT } from '@validpost/react/translation/get.transation.service.client';

export function StepChannels() {
  const t = useT();
  return (
    <StepFrame
      title={t('setup_channels_title', 'Connect channels')}
      subtitle={t(
        'setup_channels_subtitle',
        'Configure the social channels you want to publish to. You can add more channels later from Settings → Channels.'
      )}
    >
      <ChannelsTab />
    </StepFrame>
  );
}
