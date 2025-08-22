const path = require('path');

module.exports = function override(config, env) {
  // Disable filename hashing for production builds
  if (env === 'production') {
    // Disable CSS filename hashing
    const miniCssExtractPlugin = config.plugins.find(
      plugin => plugin.constructor.name === 'MiniCssExtractPlugin'
    );
    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.filename = 'static/css/main.css';
      miniCssExtractPlugin.options.chunkFilename = 'static/css/[name].css';
    }

    // Disable JS filename hashing
    config.output.filename = 'static/js/main.js';
    config.output.chunkFilename = 'static/js/[name].js';
  }

  return config;
};