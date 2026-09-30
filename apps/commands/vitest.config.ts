import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    conditions: ['require', 'node', 'import', 'default'],
    alias: {
      '@validpost/commands': path.resolve(__dirname, 'src'),
      '@validpost/nestjs-libraries': path.resolve(__dirname, '../../libraries/nestjs-libraries/src'),
      '@validpost/helpers': path.resolve(__dirname, '../../libraries/helpers/src'),
      '@validpost/backend': path.resolve(__dirname, '../backend/src'),
      '@validpost/provider-kernel': path.resolve(__dirname, '../../libraries/providers/kernel/src'),
      'nestjs-command': path.resolve(__dirname, '../../node_modules/nestjs-command/dist/index.js'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
});
