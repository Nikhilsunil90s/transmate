const custom = require("./webpack.config.js");

module.exports = {
  stories: [
    // "../**/*.stories.js",
    //  "../imports/client/**/*.stories.@(js|mdx)",
    //"../imports/client/**/ShipmentRequest.stories.js",
    // "../imports/client/**/stage.stories.js",
    // "../imports/client/**/Costs.stories.js",
    "../imports/utils/**/*.stories.js"
    //"../imports/client/views/price-list/PriceList.stories.js"
  ],
  addons: ["@storybook/addon-essentials"],
  webpackFinal: config => {
    const final = {
      ...config,
      resolve: { ...config.resolve, ...custom.resolve },
      module: {
        ...config.module,
        rules: [...config.module.rules, ...custom.module.rules]
      },
      plugins: [...config.plugins, ...custom.plugins]
    };
    return final;
  }
};
