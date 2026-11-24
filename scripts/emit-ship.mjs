#!/usr/bin/env node
import { transformSync } from '@babel/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(PROJECT_ROOT, 'ship');

const TS_EXTENSIONS = new Set(['.ts', '.tsx']);
const COPIED_EXTENSIONS = new Set(['.js', '.jsx', '.html', '.css']);
const SKIP_DIR_NAMES = new Set(['node_modules', 'dist', 'coverage', 'ship', '.git', '__tests__']);
const TEST_FILE_RE = /\.(test|spec)\.[jt]sx?$/;

function jsExtensionFor(tsExtension) {
  return tsExtension === '.tsx' ? '.jsx' : '.js';
}

function transpileFile(srcPath, destPath) {
  const source = fs.readFileSync(srcPath, 'utf8');
  const { code } = transformSync(source, {
    filename: srcPath,
    comments: false,
    babelrc: false,
    configFile: false,
    presets: ['@babel/preset-typescript'],
    plugins: srcPath.endsWith('.tsx') ? ['@babel/plugin-syntax-jsx'] : [],
  });
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, code);
}

function copyFileVerbatim(srcPath, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(srcPath, destPath);
}

function emitFile(srcPath, destDir, name) {
  const ext = path.extname(name);
  if (TEST_FILE_RE.test(name)) return;
  if (TS_EXTENSIONS.has(ext)) {
    transpileFile(srcPath, path.join(destDir, name.slice(0, -ext.length) + jsExtensionFor(ext)));
    return;
  }
  if (COPIED_EXTENSIONS.has(ext.toLowerCase())) copyFileVerbatim(srcPath, path.join(destDir, name));
}

function walkAndEmit(srcDir, destDir) {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (SKIP_DIR_NAMES.has(entry.name)) continue;
    const srcPath = path.join(srcDir, entry.name);
    if (entry.isDirectory()) {
      walkAndEmit(srcPath, path.join(destDir, entry.name));
      continue;
    }
    emitFile(srcPath, destDir, entry.name);
  }
}

function writeWebpackConfig() {
  const config = `import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  context: __dirname,
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.[contenthash].js',
    publicPath: 'auto',
    clean: true,
  },
  resolve: {
    extensions: ['.jsx', '.js'],
    alias: { '@': path.resolve(__dirname, 'src') },
    fullySpecified: false,
  },
  module: {
    rules: [
      {
        test: /\\.jsx?$/,
        exclude: /node_modules/,
        resolve: { fullySpecified: false },
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            presets: [
              ['@babel/preset-env', { targets: '> 0.25%, not dead' }],
              ['@babel/preset-react', { runtime: 'automatic' }],
            ],
          },
        },
      },
      {
        test: /\\.module\\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { modules: { namedExport: false, exportLocalsConvention: 'as-is' } },
          },
        ],
      },
      {
        test: /\\.css$/,
        exclude: /\\.module\\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\\.(svg|png|jpe?g|webp)$/,
        type: 'asset/resource',
        generator: { filename: 'img/[name].[contenthash][ext]' },
      },
      { test: /\\.woff2?$/, type: 'asset/resource', generator: { filename: 'fonts/[name][ext]' } },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html', filename: 'index.html' }),
    new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash].css' }),
  ],
};
`;
  fs.writeFileSync(path.join(OUT_DIR, 'webpack.config.js'), config);
}

function main() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  walkAndEmit(path.join(PROJECT_ROOT, 'src'), path.join(OUT_DIR, 'src'));
  copyFileVerbatim(
    path.join(PROJECT_ROOT, 'public', 'index.html'),
    path.join(OUT_DIR, 'public', 'index.html'),
  );
  writeWebpackConfig();
  console.log(`ship: emitted a plain-JavaScript copy to ${path.relative(PROJECT_ROOT, OUT_DIR)}/`);
}

main();
