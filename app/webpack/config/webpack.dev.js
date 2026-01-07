const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const webpackCommonConfig = require('./webpack.common');

// dev-server 配置
const DEV_SERVER_CONFIG = {
  HOST: '127.0.0.1',
  PORT: 2024,
  HMR_PATH: '__webpack_hmr', // 官方指定
  TIMEOUT: 20000
}

// 开发环境的 entry 配置，需要加入 hmr 配置
Object.keys(webpackCommonConfig.entry).forEach(v => {
  if (v !== 'vendor') {
    const { HOST, PORT, HMR_PATH, TIMEOUT } = DEV_SERVER_CONFIG;
    webpackCommonConfig.entry[v] = [
      // 主文件入口
      webpackCommonConfig.entry[v],
      // hmr 更新入口，官方指定的 hmr 路径
      `${require.resolve('webpack-hot-middleware/client')}?path=http://${HOST}:${PORT}/${HMR_PATH}?timeout=${TIMEOUT}&reload=true`
    ]
  }
})

const webpackDevConfig = merge.smart(webpackCommonConfig, {
  mode: 'development',
  // 开发环境打包产物输出
  output: {
    path: path.resolve(process.cwd(), './app/public/dist/dev/'), // dev 输出文件路径
    publicPath: `http://${DEV_SERVER_CONFIG.HOST}:${DEV_SERVER_CONFIG.PORT}/public/dist/dev/`, // 服务器-外部资源的路径
    filename: 'js/[name]_[chunkhash:8].bundle.js',
    globalObject: 'this',
  },
  plugins: [
    // 应用运行时，可以热模块替换
    new webpack.HotModuleReplacementPlugin({
      multiStep: false, // 多步
    }),
  ],
  devtool: 'cheap-module-source-map'
})

module.exports = {
  // webpack 配置
  webpackDevConfig,
  // 提供给 dev 环境启动脚本 dev.js 使用
  DEV_SERVER_CONFIG
};