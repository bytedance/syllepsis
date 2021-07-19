import { defineConfig } from 'vite';
import pkgJson from './package.json';

export default defineConfig({
  build: {
    minify: false,
    brotliSize: false,
    outDir: '.',
    sourcemap: true,
    emptyOutDir: false,
    rollupOptions: {
      input: pkgJson.module,
      output: {
        entryFileNames: pkgJson.umd,
        name: pkgJson.name,
        format: 'umd'
      },
      external: Object.keys(pkgJson.dependencies)
    }
  }
});
