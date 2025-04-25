import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    preserveModules: true,
    preserveModulesRoot: 'src',
  },
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@ethersproject/providers',
    '@metamask/detect-provider',
    '@walletconnect/ethereum-provider',
    'js-cookie',
    'zustand',
    'zustand/vanilla',
    'zustand/middleware',
    'zustand/shallow',
  ],
  plugins: [
    commonjs({
      requireReturnsDefault: 'auto',
    }),
    resolve({
      preferBuiltins: false,
      browser: true,
    }),
    typescript(),
    json(),
  ],
};
