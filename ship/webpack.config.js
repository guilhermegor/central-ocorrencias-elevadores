import HtmlWebpackPlugin from 'html-webpack-plugin';
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
        test: /\.jsx?$/,
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
        test: /\.module\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { modules: { namedExport: false, exportLocalsConvention: 'as-is' } },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(svg|png|jpe?g|webp)$/,
        type: 'asset/resource',
        generator: { filename: 'img/[name].[contenthash][ext]' },
      },
      { test: /\.woff2?$/, type: 'asset/resource', generator: { filename: 'fonts/[name][ext]' } },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html', filename: 'index.html' }),
    new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash].css' }),
  ],
};
