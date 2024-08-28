/* eslint-disable */
const postcss = require('rollup-plugin-postcss');
const autoExternal = require('rollup-plugin-auto-external');
const sourcemaps = require('rollup-plugin-sourcemaps');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const typescript = require('rollup-plugin-typescript2');

const isProduction = process.env.NODE_ENV === 'production';

console.log('isProduction------------', isProduction);

const config = {
  input: 'src/index.tsx',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: !isProduction ? 'inline' : false
    },
    {
      file: 'dist/index.js',
      format: 'esm',
      exports: 'named',
      sourcemap: !isProduction ? 'inline' : false
    }
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/examples/**']
    }),
    autoExternal({ packagePath: './package.json' }),
    postcss({
      extract: false,
      minimize: true,
      modules: false,
      plugins: []
    }),
    babel(),
    commonjs(),
    !isProduction && sourcemaps() // Only include sourcemaps plugin in non-production builds
  ].filter(Boolean) // Filter out falsy values like `false`
};

module.exports = config;
