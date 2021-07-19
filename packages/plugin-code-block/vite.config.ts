import { defineConfig } from 'vite';
import pkgJson from './package.json';
import { checkIsExternal } from '../../scripts/build';

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
        name: pkgJson.name,
        format: 'umd',
        entryFileNames: pkgJson.umd
      },
      external: checkIsExternal(([] as string[]).concat(Object.keys(pkgJson.dependencies)))
    }
  }
});
