const {rewireEmotion} = require("react-app-rewire-emotion");

module.exports = function override(config, env) {
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
