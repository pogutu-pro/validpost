import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@validpost/provider-kernel': path.resolve(__dirname, '../kernel/src'),
      '@validpost/provider-kernel/*': path.resolve(__dirname, '../kernel/src/*'),
      '@validpost/nestjs-libraries': path.resolve(__dirname, '../../nestjs-libraries/src'),
      '@validpost/helpers': path.resolve(__dirname, '../../helpers/src'),
      '@validpost/backend': path.resolve(__dirname, '../../../apps/backend/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'src/**/*.int-spec.ts'],
    exclude: ['node_modules', 'dist'],
  },
});
