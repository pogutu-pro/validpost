'use client';

import {
  PostComment,
  withProvider,
} from '@validpost/frontend/components/composer/providers/high.order.provider';
import { FC } from 'react';
import { DiscordDto } from '@validpost/nestjs-libraries/dtos/posts/providers-settings/discord.dto';
import { DiscordChannelSelect } from '@validpost/frontend/components/composer/providers/discord/discord.channel.select';
import { useSettings } from '@validpost/frontend/components/launches/helpers/use.values';
import { FirstCommentField } from '@validpost/frontend/components/composer/providers/shared/first-comment.field';
const DiscordComponent: FC = () => {
  const form = useSettings();
  return (
    <div>
      <DiscordChannelSelect {...form.register('channel')} />
      <FirstCommentField />
    </div>
  );
};
export default withProvider({
  postComment: PostComment.COMMENT,
  minimumCharacters: [],
  SettingsComponent: DiscordComponent,
  CustomPreviewComponent: undefined,
  dto: DiscordDto,
  maximumCharacters: 1980,
});
