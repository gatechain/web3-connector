import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const isRemoveLog = process.env.NODE_ENV === 'production';

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
    '@ethersproject/address',
    '@metamask/detect-provider',
    '@walletconnect/ethereum-provider',
    'zustand',
    'zustand/middleware',
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
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.ts', '.tsx'],
      include: ['src/**/*'],
      plugins: isRemoveLog
        ? [['transform-remove-console', { exclude: ['error', 'warn', 'info'] }]]
        : [],
    }),
  ],
};
