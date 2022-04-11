/* eslint-disable no-return-assign */
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  console.log("let's build for production!");
} else {
  console.log("let's build for test!");
}
const files = {
  env: "../.env-cmdrc.js"
};

const plugins = [];

module.exports = {
  optimization: { minimize: false },
  entry: files,
  plugins,
  output: {
    path: path.resolve(__dirname, ""),
    filename: "[name].js",
    libraryTarget: "umd"
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json"]
  },
  node: {
    __dirname: true
  },
  externals: { saslprep: "require('saslprep')" },
  target: "node"
};

