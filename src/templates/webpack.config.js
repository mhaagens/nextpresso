import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import StartServerWebpackPlugin from "start-server-webpack-plugin";
import Dotenv from "dotenv-webpack";
import { resolve } from "path";

export default {
  entry: ["webpack/hot/poll?1000", resolve(__dirname, "src", "index.js")],
  watch: true,
  target: "node",
  node: {
    __filename: false,
    __dirname: false
  },
  externals: [
    nodeExternals({
      whitelist: ["webpack/hot/poll?1000"]
    })
  ],
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
    new Dotenv(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new StartServerWebpackPlugin({
      name: "server.js"
    })
  ],
  output: {
    filename: "server.js",
    path: resolve(__dirname, "dist")
  }
};