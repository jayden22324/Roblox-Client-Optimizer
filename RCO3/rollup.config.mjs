// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/index.ts',
  output: {
    // out file
    file: 'dist/index.js',
    // cjs
    format: 'cjs',
    // inline dynamic imports
    inlineDynamicImports: true,
    // no dynamic imports in cjs
    dynamicImportInCjs: false,
    // sourcemap
    sourcemap: true,
  },
  plugins: [commonjs(), nodeResolve(), typescript(),]
};