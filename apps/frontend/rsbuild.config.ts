import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    base: '/text-linker/',
  },
  html: {
    title: 'LiITA Text Linker',
    meta: {
      ...(process.env.BACKEND_URL && { 'backend-url': process.env.BACKEND_URL }),
    },
  },
});
