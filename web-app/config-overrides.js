const {rewireEmotion} = require("react-app-rewire-emotion");
const {injectBabelPlugin} = require("react-app-rewired");

module.exports = function override(orgConfig, env) {
  let config = orgConfig;

  config = injectBabelPlugin(["babel-plugin-graphql-tag", {}], config);

  if (env === "production") {
    return rewireEmotion(config, env, {hoist: true});
  } else {
    return rewireEmotion(config, env, {
      sourceMap: true,
      autoLabel: true,
      labelFormat: "[filename]--[local]",
    });
  }
};
