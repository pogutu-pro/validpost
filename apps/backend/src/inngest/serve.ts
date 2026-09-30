import { serve } from 'inngest/express';
import { inngest } from '@validpost/nestjs-libraries/inngest/inngest.client';

export const createInngestServeHandler = (functions: any[]) =>
  serve({ client: inngest, functions });
