import { defineConfig } from 'vite';
import pkgJson from './package.json';
import { checkIsExternal } from '../../scripts/build';

export default defineConfig({
  build: {
    minify: false,
    brotliSize: false,
    outDir: '.',
    cssCodeSplit: true,
    sourcemap: true,
    emptyOutDir: false,
    rollupOptions: {
      input: pkgJson.module,
      output: {
        entryFileNames: pkgJson.umd,
        name: pkgJson.name,
        format: 'umd'
      },
      external: checkIsExternal(
        ([] as string[]).concat(Object.keys(pkgJson.dependencies), Object.keys(pkgJson.peerDependencies))
      )
    }
  }
});
