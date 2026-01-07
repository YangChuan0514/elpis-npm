// 启动本地开发环境
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const WebpackDevMiddleware = require('webpack-dev-middleware');
const WebpackHotMiddleware = require('webpack-hot-middleware');

module.exports = () => {
  const { webpackDevConfig, DEV_SERVER_CONFIG } = require('./config/webpack.dev');

  const app = express(); // 初始化 express 服务
  
  const compiler = webpack(webpackDevConfig);  
  
  // 指定 静态文件目录
  app.use(express.static(path.join(process.cwd(), './app/public/dist')))
  
  // 监控文件改动： WebpackDevMiddleware
  app.use(WebpackDevMiddleware(compiler, {
    // 落地文件
    writeToDisk: (filePath) => filePath.endsWith('.tpl'),
    // 资源路径
    publicPath: webpackDevConfig.output.publicPath,
    // headers
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, HEAD, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Request-With, Content-Type, Authorization',
    },
    stats: {
      colors: true,
    }
  }))
  
  // 热更新，通知浏览器：WebpackHotMiddleware
  app.use(WebpackHotMiddleware(compiler, {
    path: `/${DEV_SERVER_CONFIG.HMR_PATH}`,
    log: () => {}
  }))
  
  console.log('=== 等待 webpack 初次构建完成... ===');
  
  const { PORT } = DEV_SERVER_CONFIG;
  
  // 启动 dev 服务
  app.listen(PORT, () => {
    console.log(`dev server listening on port: ${PORT}`);
  })
}