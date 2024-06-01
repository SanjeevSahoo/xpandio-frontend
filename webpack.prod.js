const path = require("path");
const { merge } = require("webpack-merge");
const webpack = require("webpack");
const common = require("./webpack.common.js");
require("dotenv").config({ path: "./production.env" });

module.exports = merge(common, {
  mode: "production",
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  output: {
    filename: "[name].[contenthash].js",
    // publicPath: "/",
    publicPath: process.env.REACT_APP_BASENAME,
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
  ],
  optimization: {
    // minimize: false,
    splitChunks: {
      minSize: 10000,
      maxSize: 250000,
    },
  },
});
