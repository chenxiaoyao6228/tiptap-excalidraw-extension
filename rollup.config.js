/* eslint-disable */
const postcss = require('rollup-plugin-postcss');
const autoExternal = require('rollup-plugin-auto-external');
const sourcemaps = require('rollup-plugin-sourcemaps');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const typescript = require('rollup-plugin-typescript2');

const config = {
  input: 'src/index.tsx',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      exports: 'named',
      // sourcemap: true // FIXME:
      sourcemap: 'inline'
    },
    {
      file: 'dist/index.js',
      format: 'esm',
      exports: 'named',
      // sourcemap: true
      sourcemap: 'inline'
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
    sourcemaps()
  ]
};

module.exports = config;
