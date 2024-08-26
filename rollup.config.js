import ts from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "src/index.ts",
  output: {
    dir: "dist",
    name: "index",
    // format: "cjs",
  },
  // treeshake: {
  //   moduleSideEffects: false,
  // },
  plugins: [
    commonjs({ exclude: ["node_modules/pino-pretty/**"] }),
    ts(),
    json(),
  ],
  // external: ["react"],
};
