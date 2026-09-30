'use client';

import React from 'react';
import { mutate as globalMutate } from 'swr';
import { ProviderSettingsPanel } from '@validpost/frontend/components/settings/shared/kit/provider-settings-panel';
import { useOAuthReturn } from '@validpost/frontend/components/settings/shared/kit/use-oauth-return';
import { shortlinksDescriptor } from '@validpost/frontend/components/settings/shared/kit/descriptors/shortlinks.descriptor';

export const ShortlinksTab = () => {
  useOAuthReturn({
    storageKey: 'oauth_shortlink_provider',
    callbackUrl: (id) => `/settings/shortlinks/config/${id}/oauth/callback`,
    tab: 'shortlinks',
    onConnected: () => globalMutate('org-shortlinks-config'),
  });

  // The settings shell already renders the per-tab header, so hide the panel's.
  return <ProviderSettingsPanel descriptor={shortlinksDescriptor} hideHeader />;
};
