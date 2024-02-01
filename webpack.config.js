const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const SpritePlugin = require("svg-sprite-loader/plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: "all",
    },
  };

  if (isProd) {
    config.minimizer = [new OptimizeCssAssetsPlugin(), new TerserWebpackPlugin()];
  }

  return config;
};

const fileLoaderConfig = (ext) => [
  {
    loader: "file-loader",
    options: {
      name: "[name].[ext]",
      outputPath: `assets/${ext}`,
    },
  },
];

const filename = (ext) => (isDev ? `[name].${ext}` : `[name].[hash].${ext}`);

module.exports = {
  entry: path.join(__dirname, "src", "script.js"),
  output: {
    path: path.join(__dirname, "dist"),
    filename: "index.[contenthash].js",
    assetModuleFilename: path.join("images", "[name].[contenthash][ext]"),
  },
  // entry: ["@babel/polyfill", "./src/js/index.js"],
  // output: {
  //   filename: filename("js"),
  //   path: path.resolve(__dirname, "dist"),
  // },
  module: {
    rules: [
      {
        test: /\.(less)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {},
          },
          "css-loader",
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                paths: [path.resolve(__dirname, "src/styles")],
                sourceMap: true,
              },
            },
          },
        ],
      },
      {
        test: /\.(css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {},
          },
          "css-loader",
        ],
      },
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/fonts/[name][ext][query]",
        },
      },
      {
        test: /\.pug$/,
        loader: "pug-loader",
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        exclude: path.resolve(__dirname, "src/assets/sprite"),
        use: fileLoaderConfig("img"),
      },
      {
        test: /\.svg$/,
        include: path.resolve(__dirname, "src/assets/sprite"),
        use: [
          {
            loader: "svg-sprite-loader",
            options: {
              extract: true,
              outputPath: "/assets/sprite/",
            },
          },
          "svgo-loader",
        ],
      },
    ],
  },
  devServer: {
    port: 3002,
    hot: isDev,
    historyApiFallback: true,
  },
  devtool: isDev ? "source-map" : false,
  optimization: optimization(),
  plugins: [
    new SpritePlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src/pages", "index.pug"),
      filename: "index.html",
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src/pages", "main-page.pug"),
      filename: "main-page.html",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "./src/assets/img",
          to: "./assets/img",
        },
        {
          from: "./src/assets/files",
          to: "./assets/files",
        },
        {
          from: "./src/assets/img-demo",
          to: "./assets/img-demo",
        },
      ],
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
    // new FileManagerPlugin({
    //   events: {
    //     onStart: {
    //       delete: ["dist"],
    //     },
    //     onEnd: {
    //       copy: [
    //         {
    //           source: path.join("src", "static"),
    //           destination: "dist",
    //         },
    //       ],
    //     },
    //   },
    // }),
  ],
  // optimization: {
  //   minimizer: [
  //     new ImageMinimizerPlugin({
  //       minimizer: {
  //         implementation: ImageMinimizerPlugin.imageminMinify,
  //         options: {
  //           plugins: [
  //             ["gifsicle", { interlaced: true }],
  //             ["jpegtran", { progressive: true }],
  //             ["optipng", { optimizationLevel: 5 }],
  //             ["svgo", { name: "preset-default" }],
  //           ],
  //         },
  //       },
  //     }),
  //   ],
  // },
};
