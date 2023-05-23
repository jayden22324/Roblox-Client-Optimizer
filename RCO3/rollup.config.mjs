// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true,
      dynamicImportInCjs: false
    },
    {
      file: 'dist/module.js',
      format: 'esm',
      sourcemap: true,
      inlineDynamicImports: true,
    }
  ],
  plugins: [commonjs(), nodeResolve(), typescript({
    declaration: true,
    declarationDir: "dist",
    declarationMap: true,
    module: 'esnext',
  }),]
};