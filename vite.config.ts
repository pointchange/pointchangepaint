import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// import electron from "vite-plugin-electron";
import { join, resolve } from 'node:path';
import electronRenderer from "vite-plugin-electron-renderer";
import polyfillExports from "vite-plugin-electron-renderer"
// import electron from 'vite-plugin-electron/simple'
import electron from 'vite-plugin-electron'
// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode == 'development' ? '' : './',
  // publicDir: 'resources',
  plugins: [
    vue(),
    vueDevTools(),
    // electron([
    //   {
    //     entry: join(__dirname, "src/main/index.ts"),
    //   },
    //   {
    //     entry: join(__dirname, 'src/preload/preload.ts')
    //   },
    // ]),
    // electron({
    //   main: {
    //     entry: join(__dirname, "src/main/index.ts"),
    //   },
    //   preload: {
    //     input: join(__dirname, 'src/preload/preload.ts'),
    //   },
    // }),
    electron([
      {
        entry: join(__dirname, "src/main/index.ts"),
        vite: {
          build: {
            outDir: 'dist/src/main',
          }
        }
      },
      {
        entry: join(__dirname, 'src/preload/preload.ts'),
        vite: {
          build: {
            outDir: 'dist/src/preload',
          }
        }
      }
    ]),
    electronRenderer(),
    polyfillExports(),
  ],
  // root: "src",
  build: {
    rollupOptions: {
      input: {
        main: join(__dirname, './src/page/main/index.html'),
        screenshot: join(__dirname, './src/page/screenshot/index.html'),
      },
    },
    assetsInlineLimit: 0,
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      // '@main': fileURLToPath(new URL('./src/page/main', import.meta.url)),
      // '@screenshot': fileURLToPath(new URL('./src/page/screenshot', import.meta.url))
      '@main': join(__dirname, 'src/page/main'),
      '@screenshot': join(__dirname, 'src/page/screenshot')
    },
  },
}))
