const path = require('path');
const OS = require('os');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackInjectAttributesPlugin = require('html-webpack-inject-attributes-plugin');
// const HappyPack = require('happypack'); // 太老了，而且多线程打包是非必要的，项目庞大使用才有正收益

const webpackCommonConfig = require('./webpack.common');

// happyPack 多线程打包的配置
// const happyPackCommonConfig = {
//   debug: false,
//   threadPool: HappyPack.ThreadPool({ size: OS.cpus().length }),
// }

// thread-loader 打包参数
const ThreadLoaderConfig = {
  workers: OS.cpus().length,
  // 额外的 node.js 参数
  workerNodeArgs: ['--max-old-space-size=1024'],
  workerParallelJobs: 50, // 一个 worker 进程中并行执行工作的数量
}

const webpackProdConfig = merge.smart(webpackCommonConfig, {
  mode: 'production',
  // 打包产物输出
  output: {
    path: path.join(process.cwd(), './app/public/dist/prod'),
    publicPath: '/dist/prod/', // 公共路径
    filename: 'js/[name]_[chunkhash:8].bundle.js',
    crossOriginLoading: 'anonymous', // 跨域
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: require.resolve('thread-loader'), // 小项目没有必要使用，启动进程也需要时间的
            options: {
              ...ThreadLoaderConfig
            }
          },
          require.resolve('css-loader'),
          // 'happypack/loader?id=css',
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: require.resolve('thread-loader'), // 小项目没有必要使用，启动进程也需要时间的
            options: {
              ...ThreadLoaderConfig
            }
          },
          require.resolve('css-loader'),
          require.resolve('less-loader'),
          // 'happypack/loader?id=css',
        ]
      },
      {
        test: /\.js$/,
        include: [
          // 只对业务代码打包，加快构建速度
          path.resolve(__dirname, '../../pages'), // elpis 
          path.resolve(process.cwd(), './app/pages'), // 业务
        ],
        use: [
          {
            loader: require.resolve('thread-loader'),
            options: {
              ...ThreadLoaderConfig
            }
          },
          {
            loader: require.resolve('babel-loader'),
            options: {
              presets: [require.resolve('@babel/preset-env')],
              plugins: [
                require.resolve('@babel/plugin-transform-runtime')
              ]
            }
          }
        ]
        // use: [ 'happypack/loader?id=js' ]
      },
    ]
  },
  plugins: [
    // 打包输出之前，情况打包产物目录
    new CleanWebpackPlugin(['public/dist'], {
      root: path.resolve(process.cwd(), './app/'),
      exclude: [],
      verbose: true,
      dry: false,
    }),
    // 提取 css 公共部分
    new MiniCssExtractPlugin({
      chunkFilename: 'css/[name]_[contenthash:8].bundle.css',
    }),
    // 多线程打包 css
    // new HappyPack({
    //   ...happyPackCommonConfig,
    //   id: 'css',
    //   loaders: [{
    //     path: 'css-loader',
    //     options: {
    //       importLoaders: 1
    //     }
    //   }]
    // }),
    // 优化压缩 css
    new CssMinimizerWebpackPlugin(),
    // 多线程打包 js
    // new HappyPack({
    //   ...happyPackCommonConfig,
    //   id: 'js',
    //   loaders: [`babel-loader?${JSON.stringify({
    //     presets: ['@babel/preset-env'],
    //     plugins: [
    //       '@babel/plugin-transform-runtime'
    //     ]
    //   })}`]
    // }),
    // 浏览器请求资源时 不发送用户的身份凭证
    new HtmlWebpackInjectAttributesPlugin({
      crossorigin: 'anonymous'
    })
  ],
  optimization: {
    // 使用 terser 的并发和缓存特性，加快压缩速度
    minimize: true,
    minimizer: [
      new TerserPlugin({
        cache: true, // 启用缓存
        parallel: true, // 启用多进程并发运行功能
        terserOptions: {
          compress: {
            drop_console: true, // 去掉console打印
          }
        }
      })
    ]
  },
  // 不需要展示大量的 hints 信息
  performance: {
    hints: false,
  }
})

module.exports = webpackProdConfig;