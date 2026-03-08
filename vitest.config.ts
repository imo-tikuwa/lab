import { fileURLToPath, URL } from 'node:url';
import { defineConfig, configDefaults } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dirs: ['src/components'],
      resolvers: [PrimeVueResolver()],
      dts: false,
    }),
    AutoImport({
      imports: ['vue', 'pinia', '@vueuse/core'],
      dirs: ['src/composables', 'src/stores', 'src/utils'],
      vueTemplate: true,
      dts: false,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        'src/main.ts',
        '**/*.config.ts',
        '**/node_modules/**',
      ],
    },
  },
});
