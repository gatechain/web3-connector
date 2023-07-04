const path = require("path");
const package = require("./package");
const webpack = require("webpack");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  entry: "./src/index.ts",
  mode: "production",
  output: {
    filename: `web3-connector.${package.version}.js`,
    path: path.resolve(__dirname, "dist"),
    library: {
      name: "web3Connector",
      type: "umd",
    },
    publicPath: "https://webpro.gateweb3.cc/lib/", // https://webpro.gateweb3.cc/lib
    // publicPath: "/js/web3/", // https://webpro.gateweb3.cc/lib
  },
  resolve: {
    extensions: [".ts", ".js"],
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
  optimization: {
    splitChunks: {
      name: "no",
      cacheGroups: {
        defaultVendors: {
          name: "modules",
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
};
