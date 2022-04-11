const webpack = require("@cypress/webpack-preprocessor");
const fs = require("fs");
const path = require("path");

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  console.log("loaded");
  
  // code coverage
  if (process.env.BABEL_ENV === "COVERAGE") {
    console.log("code coverage is enabled");
    require("@cypress/code-coverage/task")(on, config);
    on("file:preprocessor", require("@cypress/code-coverage/use-babelrc"));
  }

  const options = {
    // send in the options from your webpack.config.js, so it works the same
    // as your app's code
    webpackOptions: require("../webpack.config.js"),
    watchOptions: {}
  };
  on("file:preprocessor", webpack(options));

  on("before:browser:launch", (browser = {}, launchOptions) => {
    if (browser.name === "chrome") {
      launchOptions.args.push("--disable-dev-shm-usage");
      return launchOptions;
    }
  });

  on("task", {
    getSchema(type) {
      return fs.readFileSync(
        path.resolve(__dirname, `../fixtures/test-schema${type}.gql`),
        "utf8"
      );
    }
  });

  return config;
};
