const path = require("path");
const package = require("./package");
const webpack = require("webpack");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  entry: "./lib/index.ts",
  mode: "production",
  output: {
    filename: `umd/web3-connector.${package.version}.js`,
    path: path.resolve(__dirname, "dist"),
    library: {
      name: "web3Connector",
      type: "umd",
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".cjs": [".cjs", ".cts"],
      ".mjs": [".mjs", ".mts"],
    },
  },
  module: {
    rules: [{ test: /\.([cm]?ts|tsx)$/, loader: "ts-loader" }],
  },
  externals: {
    ethers: {
      root: "ethers",
      commonjs2: "ethers",
      commonjs: "ethers",
      amd: "ethers",
      umd: "ethers",
    },
    react: {
      root: "React",
      commonjs2: "react",
      commonjs: "react",
      amd: "react",
      umd: "react",
    },
  },

  // plugins: [new BundleAnalyzerPlugin()],
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
};
