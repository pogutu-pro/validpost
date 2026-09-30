'use client';
import { useCallback } from 'react';
import useSWR from 'swr';
import { useFetch } from '@validpost/helpers/utils/custom.fetch';
import { useSearchParams, useRouter } from 'next/navigation';
import { Composer } from '@validpost/frontend/components/composer/composer';
import { LoadingComponent } from '@validpost/frontend/components/layout/loading';
import { newDayjs } from '@validpost/frontend/components/layout/set.timezone';
import { EmptyState } from '@validpost/frontend/components/ui/empty-state';
import { Button } from '@validpost/react/form/button';
import { useAddProvider } from '@validpost/frontend/components/launches/add.provider.component';
import { usePermissions } from '@validpost/frontend/components/layout/use-permissions';
import { useT } from '@validpost/react/translation/get.transation.service.client';

export default function CreatePostPage() {
  const fetch = useFetch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const loadIntegrations = useCallback(async (path: string) => {
    return (await (await fetch(path)).json()).integrations;
  }, [fetch]);

  const { data: integrations, isLoading, mutate } = useSWR(
    '/integrations/list',
    loadIntegrations,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      revalidateOnMount: true,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      fallbackData: [],
    }
  );

  const t = useT();
  const permissions = usePermissions();
  const addChannel = useAddProvider(() => mutate());

  const dateParam = searchParams.get('date');
  const channelParam = searchParams.get('channel');
  const contentParam = searchParams.get('content');

  const date = dateParam ? newDayjs(dateParam) : newDayjs();
  const selectedChannels = channelParam ? [channelParam] : undefined;
  const onlyValues = contentParam
    ? [{ content: decodeURIComponent(contentParam), id: 'new' }]
    : undefined;

  const handleLoadDraft = useCallback(
    (group: string) => {
      router.push(`/posts/post/${group}`);
    },
    [router]
  );

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (!integrations.length) {
    // Zero-channel accounts used to render a blank page here. Offer the
    // add-channel flow instead; members without channels:create just get
    // the explanation (optimistic-render: hide the action only once resolved).
    const canCreateChannels =
      !permissions.isResolved || permissions.hasPermission('channels', 'create');
    return (
      <div className="flex flex-1 w-full justify-center items-start p-[40px] mobile:p-[16px]">
        <EmptyState
          className="w-full max-w-[480px]"
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          }
          title={t('composer_no_channels_title', 'No channels connected')}
          description={
            canCreateChannels
              ? t(
                  'composer_no_channels_desc',
                  'Connect a channel to start composing and scheduling posts.'
                )
              : t(
                  'composer_no_channels_desc_no_permission',
                  'Ask an admin to connect a channel before composing posts.'
                )
          }
          action={
            canCreateChannels ? (
              <Button onClick={addChannel}>{t('add_channel', 'Add Channel')}</Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <Composer
      integrations={integrations}
      allIntegrations={integrations}
      date={date}
      selectedChannels={selectedChannels}
      onlyValues={onlyValues}
      onLoadDraft={handleLoadDraft}
    />
  );
}
