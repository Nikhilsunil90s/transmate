const webpack = require("webpack");
const path = require("path");
const createCompiler = require("@storybook/addon-docs/mdx-compiler-plugin");
const { dependencies } = require("../package.json");

const debug = require("debug")("storybook:webpack");

const pathForTranslations = path.resolve(
  __dirname,
  "../.storybook/mocks/translation.js"
);

const pathForFlowRouter = path.resolve(
  __dirname,
  "../.storybook/mocks/flowRouter.js"
);
// exclude server files in this build
const serverFilesRegex = /\/imports\/api\/.*\/server\/.*\.js/i;

const pathForMeteor = path.resolve(__dirname, "../.storybook/mocks/meteor.js");
const pathForSession = path.resolve(
  __dirname,
  "../.storybook/mocks/session.js"
);
const pathFormMongo = path.resolve(__dirname, "../.storybook/mocks/mongo.js");
const pathForUnderscore = path.resolve(
  __dirname,
  "../.storybook/mocks/meteor-underscore.js"
);
const pathForUseTracker = path.resolve(
  __dirname,
  "../.storybook/mocks/meteor-useTracker.js"
);
const pathForJQuery = path.resolve(__dirname, "../.storybook/mocks/jquery.js");
const pathForApollo = path.resolve(__dirname, "../.storybook/mocks/apollo.js");
const pathForRoles = path.resolve(__dirname, "../.storybook/mocks/roles.js");
const pathForRandom = path.resolve(__dirname, "../.storybook/mocks/random.js");
const pathForAccounts = path.resolve(
  __dirname,
  "../.storybook/mocks/meteor-accounts-base.js"
);
const pathForJobCollection = path.resolve(
  __dirname,
  "../.storybook/mocks/jobs.js"
);

const pathForBlazeLoader = path.resolve(
  __dirname,
  "../.storybook/mocks/blazeLoader.js"
);

const pathForMeteorApollo = path.resolve(
  __dirname,
  "../.storybook/mocks/routes-helpers.js"
);
const pathForRoutHelpers = path.resolve(
  __dirname,
  "../.storybook/mocks/routes-helpers.js"
);

module.exports = {
  stats: { warnings: false, warningsFilter: [/require_optional/] },
  resolve: {
    alias: {
      "./{}": path.resolve(__dirname, "../"), // for less imports
      "/imports": path.resolve(__dirname, "../imports"), // absolute path import
      "meteor/tap:i18n": pathForTranslations,
      "meteor/kadira:flow-router": pathForFlowRouter,
      "meteor/meteor": pathForMeteor,
      "meteor/mongo": pathFormMongo,
      "meteor/random": pathForRandom,
      "meteor/underscore": pathForUnderscore,
      "meteor/session": pathForSession,
      "meteor/jquery": pathForJQuery,
      "meteor/react-meteor-data": pathForUseTracker,
      "meteor/accounts-base": pathForAccounts,
      "meteor/vsivsi:job-collection": pathForJobCollection,
      "meteor/gadicc:blaze-react-component": pathForBlazeLoader,
      "meteor/apollo": pathForMeteorApollo,
      "apollo-link-ddp": pathForApollo,
      "apollo-client": pathForApollo,
      "apollo-cache-inmemory": pathForApollo,
      "@apollo/react-hooks": pathForApollo,
      Roles: pathForRoles,
      "meteor/alanning:roles": pathForRoles
    }
    // modules: [path.resolve(__dirname, "../node_modules"), path.resolve("../")]
  },
  module: {
    rules: [
      // {
      //   test: /\.css$/i,
      //   use: ["style-loader", "css-loader"]
      // },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: { url: false }
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                webpackImporter: true,
                strictMath: true,
                noIeCompat: true
              }
            }
          }
        ]
      },
      {
        // 2a. Load `.stories.mdx` / `.story.mdx` files as CSF and generate
        //     the docs page from the markdown
        test: /\.(stories|story)\.mdx$/,
        use: [
          {
            loader: "babel-loader",
            // // may or may not need this line depending on your app's setup
            options: {
              plugins: ["@babel/plugin-transform-react-jsx"]
            }
          },
          {
            loader: "@mdx-js/loader",
            options: {
              compilers: [createCompiler({})]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      Roles: ["Roles", "default"]
    }),
    new webpack.IgnorePlugin(serverFilesRegex),

    // we mock the helper (the other code imports the User collection)
    new webpack.NormalModuleReplacementPlugin(
      /routes-helpers/,
      pathForRoutHelpers
    )
  ],
  externals: {
    moment: "moment"
  }
};
Object.keys(dependencies).forEach(
  // eslint-disable-next-line no-return-assign
  nodeModule =>
    (module.exports.externals[nodeModule] = `commonjs ${nodeModule}`)
); // don't bundle externals; leave as require('module')
debug("not in webpack build" , module.exports.externals);