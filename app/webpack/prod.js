const webpack =  require('webpack');
const webpackCommon  = require('./config/webpack.prod');

module.exports = () => {
  console.log('\nbuild start...\n');

  webpack(webpackCommon, (err, stats) => {
    if (err) { 
      console.log(err);
      return
    };
    process.stdout.write(`${stats.toString({
      colors: true, // 控制台输出色彩信息
      modules: false, // 不显示每个模块的打包信息
      children: false, // 不显示子编译任务的信息
      chunks: false, // 不显示每个代码块的信息
      chunkModules: true, // 显示代码块中的模块信息
    })}`)
  });
}
