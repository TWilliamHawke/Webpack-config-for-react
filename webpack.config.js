const HtmlPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssPlugin = require('mini-css-extract-plugin')
const OverlayPlugin = require('error-overlay-webpack-plugin')
const Terser = require('terser-webpack-plugin')
const OptimizeCss = require('optimize-css-assets-webpack-plugin')
const path = require('path')

module.exports = (env = {}) => {
  const isProd = env.mode === 'production'
  const isDev = !isProd

  const getOptimization = () => {
    const settings = {
      minimize: isProd
    }

    if(isProd) {
      settings.minimizer = [
        new Terser(),
        new OptimizeCss()
      ]
    }

    return settings
  }

  const getPlugins = () => {
    const plugins = [
      new CleanWebpackPlugin(),
      new HtmlPlugin({
        template: './public/index.html',
        minify: {
          collapseWhitespace: isProd
        }
      })
    ]

    if(isDev) {
      plugins.push(new OverlayPlugin())
    }

    if(isProd) {
      plugins.push(new MiniCssPlugin({name: setFilename('css')}))
    }

    return plugins
  }

  const setFilename = ext => {
    return isProd ? `[name]-[hash:8].${ext}` : `[name].${ext}`
  }

  const useFileLoader = outputPath => {
    return {
      loader: 'file-loader',
      options: {
        outputPath,
        name: '[name]-[hash:8].[ext]'
      }
    }
  }

  const useCssLoader = loader => {
    const loaders = [
      isDev ? 'style-loader' : MiniCssPlugin.loader,
      'css-loader'
    ]

    if(loader) loaders.push(loader)

    return(loaders)
  }

  const useBabel = () => {
    const settings = [
      {
        loader: 'babel-loader',
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
          plugins: ["@babel/plugin-proposal-class-properties"]
        }
      }
    ]

    return settings
  }

  return {
    mode: isProd ? 'production' : 'development',
    stats: "errors-warnings",
    devtool: isDev ? 'cheap-module-source-map' : "",
    entry: ["@babel/polyfill", "./src/index.js"],

    plugins: getPlugins(),
    optimization: getOptimization(),

    output: {
      filename: setFilename('js'),
      path: path.resolve(__dirname, "dist")

    },

    module: {
      rules: [
        {//styles
          test: /\.css$/,
          use: useCssLoader()
        },
        {//sacc/cscc
          test: /\.s[ca]ss$/,
          use: useCssLoader('sass-loader')
        },
        {//images
          test: /\.(jpg|png|swg|jpeg|gif|ico)$/,
          use: useFileLoader('images')
        },
        {//fonts
          test: /\.(ttf|otf|eof|woff|woff2)$/,
          use: useFileLoader("fonts")
        },
        {//javascript
          test: /\.js$/,
          exclude: /node_modules/,
          use: useBabel()
        }
      ],
    },

    devServer: {
      port: 3000,
      open: true,
      hot: true,
      overlay: true,
      clientLogLevel: 'warn',
      historyApiFallback: true,
      //hotOnly: true //optional
    }

  }
}