'use client';

import useSWR from 'swr';
import { ContextWrapper } from '@validpost/frontend/components/layout/user.context';
import { ReactNode, useCallback } from 'react';
import { useFetch } from '@validpost/helpers/utils/custom.fetch';
import { Toaster } from '@validpost/react/toaster/toaster';
import { MantineWrapper } from '@validpost/react/helpers/mantine.wrapper';
import { ToolTip } from '@validpost/frontend/components/layout/top.tip';
import { CopilotProvider } from '@validpost/frontend/components/layout/copilot.provider';
export const PreviewWrapper = ({ children }: { children: ReactNode }) => {
  const fetch = useFetch();
  const load = useCallback(async (path: string) => {
    return await (await fetch(path)).json();
  }, []);
  const { data: user } = useSWR('/user/self', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
  });
  return (
    <ContextWrapper user={user}>
      <CopilotProvider>
        <MantineWrapper>
          <Toaster />
          <ToolTip />
          {children}
        </MantineWrapper>
      </CopilotProvider>
    </ContextWrapper>
  );
};
