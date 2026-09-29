'use client';

import LinkedinProvider from '@postmill-ai/frontend/components/composer/providers/linkedin/linkedin.provider';
import FacebookProvider from '@postmill-ai/frontend/components/composer/providers/facebook/facebook.provider';
import InstagramProvider from '@postmill-ai/frontend/components/composer/providers/instagram/instagram.collaborators';
import YoutubeProvider from '@postmill-ai/frontend/components/composer/providers/youtube/youtube.provider';
import TiktokProvider from '@postmill-ai/frontend/components/composer/providers/tiktok/tiktok.provider';
import ThreadsProvider from '@postmill-ai/frontend/components/composer/providers/threads/threads.provider';
import DiscordProvider from '@postmill-ai/frontend/components/composer/providers/discord/discord.provider';
import TelegramProvider from '@postmill-ai/frontend/components/composer/providers/telegram/telegram.provider';
import GmbProvider from '@postmill-ai/frontend/components/composer/providers/gmb/gmb.provider';
import { useLaunchStore } from '@postmill-ai/frontend/components/composer/store';
import { useShallow } from 'zustand/react/shallow';
import React, { FC, forwardRef, useImperativeHandle } from 'react';
import { GeneralPreviewComponent } from '@postmill-ai/frontend/components/launches/general.preview.component';
import { IntegrationContext } from '@postmill-ai/frontend/components/launches/helpers/use.integration';
import { useT } from '@postmill-ai/react/translation/get.transation.service.client';

export const Providers = [
  {
    identifier: 'linkedin',
    component: LinkedinProvider,
  },
  {
    identifier: 'linkedin-page',
    component: LinkedinProvider,
  },
  {
    identifier: 'facebook',
    component: FacebookProvider,
  },
  {
    identifier: 'instagram',
    component: InstagramProvider,
  },
  {
    identifier: 'instagram-standalone',
    component: InstagramProvider,
  },
  {
    identifier: 'youtube',
    component: YoutubeProvider,
  },
  {
    identifier: 'tiktok',
    component: TiktokProvider,
  },
  {
    identifier: 'threads',
    component: ThreadsProvider,
  },
  {
    identifier: 'discord',
    component: DiscordProvider,
  },
  {
    identifier: 'telegram',
    component: TelegramProvider,
  },
  {
    identifier: 'gmb',
    component: GmbProvider,
  },
];
export const ShowAllProviders = forwardRef(function ShowAllProviders(props, ref) {
  const { date, current, global, selectedIntegrations, allIntegrations } =
    useLaunchStore(
      useShallow((state) => ({
        date: state.date,
        selectedIntegrations: state.selectedIntegrations,
        allIntegrations: state.integrations,
        current: state.current,
        global: state.global,
      }))
    );

  const t = useT();

  useImperativeHandle(ref, () => ({
    checkAllValid: async () => {
      return Promise.all(
        selectedIntegrations.map(async (p) => await p.ref?.current.isValid())
      );
    },
    getAllValues: async () => {
      return Promise.all(
        selectedIntegrations.map(async (p) => await p.ref?.current.getValues())
      );
    },
    triggerAll: () => {
      return selectedIntegrations.map(
        async (p) => await p.ref?.current.trigger()
      );
    },
  }));

  return (
    <div className="w-full flex flex-col flex-1">
      {current === 'global' && (
        <IntegrationContext.Provider
          value={{
            date,
            integration:
              selectedIntegrations?.[0]?.integration || allIntegrations?.[0],
            allIntegrations: selectedIntegrations.map((p) => p.integration),
            value: global.map((p) => ({
              id: p.id,
              content: p.content,
              image: p.media,
            })),
          }}
        >
          {global?.[0]?.content?.length === 0 ? (
            <div>
              {t(
                'start_writing_your_post',
                'Start writing your post for a preview'
              )}
            </div>
          ) : (
            <div className="border border-borderPreview rounded-[12px] shadow-previewShadow">
              <GeneralPreviewComponent maximumCharacters={100000000} />
            </div>
          )}
        </IntegrationContext.Provider>
      )}
      {selectedIntegrations.map((integration) => {
        const { component: ProviderComponent } = Providers.find(
          (provider) =>
            provider.identifier === integration.integration.identifier
        ) || {
          component: Empty,
        };

        return (
          <ProviderComponent
            ref={integration.ref}
            key={integration.integration.id}
            id={integration.integration.id}
          />
        );
      })}
    </div>
  );
});

export const Empty: FC = () => {
  return null;
};
