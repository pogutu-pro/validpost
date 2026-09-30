import { BeehiivProvider } from '@validpost/nestjs-libraries/newsletter/providers/beehiiv.provider';
import { EmailEmptyProvider } from '@validpost/nestjs-libraries/newsletter/providers/email-empty.provider';

export const newsletterProviders = [
  new BeehiivProvider(),
  new EmailEmptyProvider(),
];
