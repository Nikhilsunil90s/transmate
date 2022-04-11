var path = require("path");

module.exports = {
  target: "web",
  // mode: "development",
  // devtool: "inline-source-map",
  resolve: {
    alias: {
      "/imports": path.resolve(__dirname, "../../imports") // absolute path import
    }
  }
  // module: {
  //   rules: [
  //     {
  //       test: "/\.js/",
  //       exclude: "/node_modules/",
  //       use: "@jsdevtools/coverage-istanbul-loader"
  //     }
  //   ]
  // }
};
