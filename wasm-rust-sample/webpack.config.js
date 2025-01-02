const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");

module.exports = {
  // Set mode depending on your environment
  mode: "development",

  // Modern replacements for deprecated babel-polyfill
  // Make sure you have `core-js` and `regenerator-runtime` installed:
  // npm install --save core-js regenerator-runtime
  entry: {
    main: ["core-js/stable", "regenerator-runtime/runtime", "./js/index.js"],
  },

  // Adjust devtool as you need; for production, consider 'source-map'
  devtool: false,

  output: {
    path: path.join(__dirname, "dist"),
    filename: "index.js",
  },

  // If you’re specifically telling webpack not to bundle certain modules
  externals: {
    uxp: "commonjs2 uxp",
  },

  resolve: {
    extensions: [".mjs", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            // Example Babel config
            presets: [
              [
                "@babel/preset-env",
                {
                  // Automatic polyfill injection based on usage
                  useBuiltIns: "usage",
                  corejs: 3,
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  experiments: {
    // Webpack 5 top-level-await support
    topLevelAwait: true,
  },

  plugins: [
    // If you still need text-encoding polyfills
    new webpack.ProvidePlugin({
      TextDecoder: ["text-encoding", "TextDecoder"],
      TextEncoder: ["text-encoding", "TextEncoder"],
    }),

    new CopyPlugin({
      patterns: [
        {
          from: "plugin",
          to: ".",
        },
      ],
    }),

    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "."),
      outName: "uxp_wasm",
      extraArgs: "--target web",
    }),

    new WebpackShellPluginNext({
      onBuildStart: {
        scripts: ["npm run inlinewasm"],
        blocking: true,
        parallel: false,
      },
    }),
  ],
};
