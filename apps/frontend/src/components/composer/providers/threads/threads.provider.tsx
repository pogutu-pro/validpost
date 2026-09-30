'use client';

import {
  PostComment,
  withProvider,
} from '@validpost/frontend/components/composer/providers/high.order.provider';
import { ThreadFinisher } from '@validpost/frontend/components/composer/finisher/thread.finisher';
import { FirstCommentField } from '@validpost/frontend/components/composer/providers/shared/first-comment.field';
const SettingsComponent = () => {
  return (
    <>
      <ThreadFinisher />
      <FirstCommentField />
    </>
  );
};

export default withProvider({
  postComment: PostComment.POST,
  minimumCharacters: [],
  SettingsComponent: SettingsComponent,
  CustomPreviewComponent: undefined,
  dto: undefined,
  maximumCharacters: 500,
});
