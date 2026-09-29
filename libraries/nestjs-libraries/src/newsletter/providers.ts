import { BeehiivProvider } from '@postmill-ai/nestjs-libraries/newsletter/providers/beehiiv.provider';
import { EmailEmptyProvider } from '@postmill-ai/nestjs-libraries/newsletter/providers/email-empty.provider';

export const newsletterProviders = [
  new BeehiivProvider(),
  new EmailEmptyProvider(),
];
