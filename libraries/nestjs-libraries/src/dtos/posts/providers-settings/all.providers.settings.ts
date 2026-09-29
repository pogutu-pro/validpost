import { YoutubeSettingsDto } from '@postmill-ai/nestjs-libraries/dtos/posts/providers-settings/youtube.settings.dto';
import { TikTokDto } from '@postmill-ai/nestjs-libraries/dtos/posts/providers-settings/tiktok.dto';
import { DiscordDto } from '@postmill-ai/nestjs-libraries/dtos/posts/providers-settings/discord.dto';
import { LinkedinDto } from '@postmill-ai/nestjs-libraries/dtos/posts/providers-settings/linkedin.dto';
import { InstagramDto } from '@postmill-ai/nestjs-libraries/dtos/posts/providers-settings/instagram.dto';
import { GmbSettingsDto } from '@postmill-ai/nestjs-libraries/dtos/posts/providers-settings/gmb.settings.dto';
import { FacebookDto } from '@postmill-ai/nestjs-libraries/dtos/posts/providers-settings/facebook.dto';
import { ThreadsSettingsDto } from '@postmill-ai/nestjs-libraries/dtos/posts/providers-settings/threads.settings.dto';
import { IsIn } from 'class-validator';

export type ProviderExtension<T extends string, M> = { __type: T } & M;
export type AllProvidersSettings =
  | ProviderExtension<'youtube', YoutubeSettingsDto>
  | ProviderExtension<'tiktok', TikTokDto>
  | ProviderExtension<'discord', DiscordDto>
  | ProviderExtension<'linkedin', LinkedinDto>
  | ProviderExtension<'linkedin-page', LinkedinDto>
  | ProviderExtension<'instagram', InstagramDto>
  | ProviderExtension<'instagram-standalone', InstagramDto>
  | ProviderExtension<'gmb', GmbSettingsDto>
  | ProviderExtension<'facebook', FacebookDto>
  | ProviderExtension<'threads', ThreadsSettingsDto>
  | ProviderExtension<'telegram', None>;

type None = NonNullable<unknown>;

export const allProviders = (setEmpty?: any) => {
  return [
    { value: YoutubeSettingsDto, name: 'youtube' },
    { value: TikTokDto, name: 'tiktok' },
    { value: DiscordDto, name: 'discord' },
    { value: LinkedinDto, name: 'linkedin' },
    { value: LinkedinDto, name: 'linkedin-page' },
    { value: InstagramDto, name: 'instagram' },
    { value: InstagramDto, name: 'instagram-standalone' },
    { value: GmbSettingsDto, name: 'gmb' },
    { value: FacebookDto, name: 'facebook' },
    { value: ThreadsSettingsDto, name: 'threads' },
    { value: setEmpty, name: 'telegram' },
  ].filter((f) => f.value);
};

export class EmptySettings {
  @IsIn(allProviders(EmptySettings).map((p) => p.name), {
    message: `"__type" must be ${allProviders(EmptySettings)
      .map((p) => p.name)
      .join(', ')}`,
  })
  __type: string;
}
