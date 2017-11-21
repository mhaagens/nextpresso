import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import CleanWebpackPlugin from "clean-webpack-plugin";
import { resolve } from "path";

export default {
  entry: [resolve(__dirname, "src", "index.js")],
  target: "node",
  node: {
    __filename: false,
    __dirname: false
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            babelrc: false,
            presets: [
              ["env", { modules: false, targets: { node: "current" } }],
              "stage-2"
            ]
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      controllers: resolve(__dirname, "src", "controllers"),
      helpers: resolve(__dirname, "src", "helpers")
    }
  },
  plugins: [
    new CleanWebpackPlugin(["dist"], {
      root: __dirname
    }),
    new webpack.NamedModulesPlugin()
  ],
  output: {
    filename: "server.js",
    path: resolve(__dirname, "dist")
  }
};
