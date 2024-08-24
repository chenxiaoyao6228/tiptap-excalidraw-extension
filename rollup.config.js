// rollup.config.js

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
      sourcemap: true
    },
    {
      file: 'dist/index.js',
      format: 'esm',
      exports: 'named',
      sourcemap: true
    }
  ],
  plugins: [
    autoExternal({ packagePath: './package.json' }),
    sourcemaps(),
    babel(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/examples/**']
    })
  ]
};

module.exports = config;
