const path = require('path');
const { sep } = path;

/**
 * config loader
 * @param {*} app koa实例
 * 
 * 配置区分 本地/测试/生产， 通过 env 环境遍历读取不同配置文件 enc.config
 * 通过 env.config 覆盖 default.config 加载到 app.config 中
 * 
 * 目录下对应的 config 配置
 * 默认配置 config/config.default.js
 * 本地配置 config/config.local.js
 * 测试配置 config/config.beta.js
 * 生产配置 config/config.prod.js
 */

module.exports = (app) => {
  // elpis 框架内置的 default.config.js 配置文件
  const elpisConfigPath = path.resolve(__dirname, `..${sep}..${sep}config`);
  let defaultConfig = require(path.resolve(elpisConfigPath, `.${sep}config.default.js`));


  // 找到加载 业务 config 相关配置文件
  const businessConfigPath = path.resolve(process.cwd(), `.${sep}config`);
  // 处理业务 config.default.js 配置文件
  try {
    defaultConfig = {
      ...defaultConfig,
      ...require(path.resolve(businessConfigPath, `.${sep}config.default.js`))
    };
  } catch (error) {
    console.log(`[exception] there is no config.default file`);
  }

  // 处理当前环境 env 的 config 配置文件
  let envConfig = {};
  try {
    envConfig = require(path.resolve(businessConfigPath, `.${sep}config.${app.env.get()}.js`));
  } catch (error) {
    console.log(`[exception] there is no config.${app.env.get()}.js file`);
  }

  // 覆盖 default 加载配置
  app.config = Object.assign({}, defaultConfig, envConfig);
}