import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'supabase/functions/_shared'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
});
