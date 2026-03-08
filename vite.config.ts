import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/lab/',
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    // ローカル SFC コンポーネント + PrimeVue コンポーネントを自動インポート
    Components({
      dirs: ['src/components'],
      resolvers: [PrimeVueResolver()],
      dts: 'src/types/components.d.ts',
    }),
    // Vue API を自動インポート
    AutoImport({
      imports: ['vue'],
      vueTemplate: true,
      dts: 'src/types/auto-imports.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
  },
  build: {
    minify: 'esbuild',
    // Vite デフォルトの 500KB 警告を抑制（gzip 後は約 200KB のため実使用上は問題なし）
    // manualChunks によるチャンク分割は CSS ロード順序の乱れを引き起こす可能性があるため採用しない
    chunkSizeWarningLimit: 800,
  },
  // プロダクションビルド時のみconsole.*とdebuggerを除去
  esbuild:
    mode === 'production'
      ? {
          drop: ['console', 'debugger'],
        }
      : {},
}))
