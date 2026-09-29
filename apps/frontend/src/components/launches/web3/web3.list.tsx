import { FC } from 'react';
import { Web3ProviderInterface } from '@postmill-ai/frontend/components/launches/web3/web3.provider.interface';
import { TelegramProvider } from '@postmill-ai/frontend/components/launches/web3/providers/telegram.provider';
export const web3List: {
  identifier: string;
  component: FC<Web3ProviderInterface>;
}[] = [
  {
    identifier: 'telegram',
    component: TelegramProvider,
  },
];
