'use client';

import { FC } from 'react';
import { AddProviderComponent } from '@validpost/frontend/components/launches/add.provider.component';
import { useFetch } from '@validpost/helpers/utils/custom.fetch';
import useSWR from 'swr';

export const MobileIntegration: FC = () => {
  const fetch = useFetch();
  const { data: integrations } = useSWR(
    '/integrations',
    async (path: string) => (await fetch(path)).json(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
    }
  );

  if (!integrations) {
    return null;
  }

  return (
    <AddProviderComponent
      isMobile={true}
      invite={false}
      update={() => {}}
      {...integrations}
    />
  );
};
