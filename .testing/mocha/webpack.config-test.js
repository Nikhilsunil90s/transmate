const webpack = require("webpack");
const path = require("path");
const isCoverage = process.env.NODE_ENV === "coverage";
const { dependencies } = require("../../package.json");

const rootPath = path.resolve(__dirname, "../../");
console.log("rootPath", rootPath);

const pathForFlowRouter = path.resolve(
  rootPath,
  "./.storybook/mocks/flowRouter.js"
);

const pathForSession = path.resolve(rootPath, "./.storybook/mocks/session.js");
const pathFormMongo = path.resolve(
  rootPath,
  "./.testing/mocha/DefaultMongo.js"
); 
const pathForUnderscore = path.resolve(
  rootPath,
  "./.storybook/mocks/meteor-underscore.js"
);
const pathForUseTracker = path.resolve(
  rootPath,
  "./.storybook/mocks/meteor-useTracker.js"
);
const pathForJQuery = path.resolve(rootPath, "./.storybook/mocks/jquery.js");
const pathForApollo = path.resolve(rootPath, "./.storybook/mocks/apollo.js");
let config = {
  mode: process.env.NODE_ENV || "development"
};

const isMochapack = process.argv.reduce(
  (result, arg) => result || arg.endsWith("mochapack"),
  false
);

if (isMochapack) {
  config = Object.assign(config, {
    mode: "development",
    target: "node",
    node: { global: true },
    devtool: "inline-cheap-source-map",
    output: {
      devtoolModuleFilenameTemplate: "[absolute-resource-path]"
    }
  });
}

module.exports = {
  ...config,
  externals: {
    mongodb: "commonjs2 mongodb",
    agenda: "commonjs2 agenda"
  },
  stats: { warnings: false, warningsFilter: [/require_optional/] },
  module: {
    rules: [
      // {
      //   test: /\.(graphql|gql)$/,
      //   exclude: /node_modules/,
      //   loader: 'graphql-tag/loader',
      // },
      ...(isCoverage
        ? [
            {
              test: /\.(js$|ts)/,
              // include: [/[\\\/]imports[\\\/].+(m?\.js$)/], // instrument only testing sources with Istanbul, after ts-loader runs
              use: {
                loader: "istanbul-instrumenter-loader",
                options: { esModules: true }
              },
              enforce: "post",
              exclude: /node_modules|\.spec\.js$/
            }
          ]
        : []),
      {
        test: /\.(m?js$|ts)/,
        // test: /[\\\/]imports[\\\/].+(m?\.js)/,
        exclude: [/node_modules/],
        include: [/imports/],
        // include: [path.resolve(__dirname, "imports")],
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            presets: ["@babel/preset-env"],
            plugins: [
              "@babel/plugin-transform-runtime",
              "@babel/plugin-proposal-optional-chaining",
              "@babel/plugin-proposal-nullish-coalescing-operator"
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
    alias: {
      "/imports/utils/server/ibmFunctions/callFunction": path.resolve(
        rootPath,
        "./.testing/mocha/mocks/callCloudFunction.js"
      ),
      "./{}": path.resolve(rootPath, "./"), // for less imports
      "/imports": path.resolve(rootPath, "./imports"), // absolute path import
     // "meteor/check": path.resolve(rootPath, "./.testing/mocha/mocks/check.js"),
      "meteor/kadira:flow-router": pathForFlowRouter,
      "meteor/meteor": path.resolve(
        rootPath,
        "./.testing/mocha/mocks/meteor.js"
      ),
      "meteor/promise": path.resolve(
        rootPath,
        "./.testing/mocha/mocks/meteorPromise.js"
      ),
      "meteor/mongo": pathFormMongo,
      "meteor/random": path.resolve(
        rootPath,
        "./.testing/mocha/mocks/random.js"
      ),
      "meteor/underscore": pathForUnderscore,
      "meteor/session": pathForSession,
      "meteor/jquery": pathForJQuery,
      "meteor/react-meteor-data": pathForUseTracker,
      "meteor/accounts-base": path.resolve(
        rootPath,
        "./.testing/mocha/mocks/meteor-accounts-base.js"
      ),
      "meteor/vsivsi:job-collection": path.resolve(
        rootPath,
        "./.testing/mocha/mocks/jobs.js"
      ),
      "apollo-link-ddp": pathForApollo,
      "apollo-client": pathForApollo,
      "apollo-cache-inmemory": pathForApollo,
      "@apollo/react-hooks": pathForApollo,
      "meteor/swydo:ddp-apollo": pathForApollo,
      "@adobe/node-fetch-retry": path.resolve(
        rootPath,
        "./.testing/mocha/mocks/fetch.js"
      )
    }
  },

  plugins: [new webpack.ProvidePlugin({})]
};


Object.keys(dependencies).forEach(
  // eslint-disable-next-line no-return-assign
  nodeModule =>
    (module.exports.externals[nodeModule] = `commonjs ${nodeModule}`)
); // don't bundle externals; leave as require('module')
