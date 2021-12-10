import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        default: '/index.html',
        mxgraph: './src/components/mxgraph/lib/index.html'
      },
    }
  }
});
