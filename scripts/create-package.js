const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const getViteConfigContent = () => `
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
        entryFileNames: pkgJson.umd,
        name: pkgJson.name,
        format: 'umd'
      },
      external: checkIsExternal(Object.keys(pkgJson.dependencies))
    }
  }
});
`;

const getPackageJsonContent = ({ name, description, author }) => ({
  name,
  author,
  description,
  version: '0.0.0',
  main: 'dist/lib/index.js',
  module: 'dist/es/index.js',
  umd: 'dist/umd/index.js',
  typings: 'dist/es/index.d.ts',
  license: 'MIT',
  sideEffects: ['*.css'],
  files: ['dist', 'src'],
  scripts: {
    prebuild: 'rimraf ./dist',
    'build:es': 'cross-env NODE_ENV=production && tsc --target es5 && copyfiles "./src/**/*.css" ./dist/es -u 1',
    'build:cjs':
      'cross-env NODE_ENV=production && tsc  --target es5 --module commonjs --outDir \'dist/lib\' && copyfiles "./src/**/*.css" ./dist/lib -u 1',
    'build:umd': 'cross-env NODE_ENV=production && vite build',
    build: 'yarn build:es && yarn build:cjs && yarn build:umd',
    watch: 'cross-env NODE_ENV=development && copyfiles "./src/**/*.css" ./dist/es -u 1 && tsc -w',
    prepublish: 'yarn build',
  },
  dependencies: {
    '@syllepsis/adapter': '*',
  },
});

inquirer
  .prompt([
    {
      type: 'input',
      name: 'folder',
      message: 'please input the folder name: ',
      validate: name => {
        if (!Boolean(name.trim())) return false;
        if (fs.existsSync(path.join(__dirname, '..', 'packages', name))) return 'folder already exist!';
        return true;
      },
    },
    {
      type: 'input',
      name: 'package',
      message: 'please input the package name(default is folder name): ',
    },
    {
      type: 'input',
      name: 'desc',
      message: 'please input the description of the package: ',
    },
  ])
  .then(({ folder, package, desc }) => {
    const dirPath = path.join(__dirname, '..', 'packages', folder.trim());
    if (fs.existsSync(dirPath)) {
      throw new Error();
    }
    fs.mkdirSync(dirPath);
    fs.writeFileSync(path.join(dirPath, 'README.md'), '');
    fs.mkdirSync(path.join(dirPath, 'src'));
    fs.writeFileSync(path.join(dirPath, 'src', 'index.ts'), '');

    const packageName = package || folder;

    // create package.json
    const user = execSync('git config user.name')
      .toString()
      .replace(/\n/, '');
    const email = execSync('git config user.email')
      .toString()
      .replace(/\n/, '');
    fs.writeFileSync(
      path.join(dirPath, 'package.json'),
      JSON.stringify(
        getPackageJsonContent({
          name: packageName,
          description: desc,
          author: `${user} <${email}>`,
        }),
        null,
        2,
      ),
    );

    // create config.json
    fs.writeFileSync(
      path.join(dirPath, 'tsconfig.json'),
      JSON.stringify(
        {
          extends: '../../tsconfig.json',
          compilerOptions: {
            outDir: 'dist/es',
          },
          include: ['src'],
        },
        null,
        2,
      ),
    );

    // create vite.config.json
    fs.writeFileSync(path.join(dirPath, 'vite.config.ts'), getViteConfigContent(), { flag: 'a' });

    // add to root package.json dependencies
    const rootJSONPath = path.join(__dirname, '..', 'package.json');
    const rootJSON = require(rootJSONPath);
    rootJSON.dependencies[packageName] = `file:packages/${folder}`;
    fs.writeFileSync(rootJSONPath, JSON.stringify(rootJSON, null, 2));
  });
