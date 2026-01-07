const Koa = require('koa');
const path = require('path');
const { sep } = path; // 处理不同操作系统的'/'路径
const env = require('./env');

// 引入loader
const middlewareLoader = require('./loader/middlerware');
const routreSchemaLoader = require('./loader/router-schema');
const rouetrLoader = require('./loader/router');
const configLoader = require('./loader/config');
const extendLoader = require('./loader/extend');
const controllerLoader = require('./loader/controller');
const serviceLoader = require('./loader/service');

module.exports = {
  /**
   * 启动项目
   * @param options 项目配置
   */
  start(options = {}) {
    // 实例 koa
    const app = new Koa();

    // 应用配置
    app.options = options;

    // 基础路径
    const baseDir = process.cwd();
    app.baseDir = baseDir;

    // 业务路径
    const businessDir = path.resolve(baseDir, `.${sep}app`)
    app.businessDir = businessDir;

    // 挂载环境变量
    app.env = env();
    console.log(`--- [start] env: ${app.env.get()} ---`);

    // 加载 middleware
    middlewareLoader(app);
    console.log(`--- [start] load middleware done ---`);

    // 加载 router-schema
    routreSchemaLoader(app);
    console.log(`--- [start] load router-schema done ---`);

    // 加载 controller
    controllerLoader(app);
    console.log(`--- [start] load controller done ---`);
    
    // 加载 service
    serviceLoader(app);
    console.log(`--- [start] load service done ---`);

    // 加载 config
    configLoader(app);
    console.log(`--- [start] load config done ---`);

    // 加载 entend
    extendLoader(app);
    console.log(`--- [start] load entend done ---`);

    // 注册 elpis 全局中间件
    const elipsGlobalMiddlewareFilePath = path.resolve(__dirname, `..${sep}app${sep}middleware.js`);
    require(elipsGlobalMiddlewareFilePath)(app);
    console.log(`--- [start] load global elpis middleware done ---`);

    // 注册 业务 全局中间件
    try {
      require(`${businessDir}${sep}middleware.js`)(app);
      console.log(`--- [start] load app-middleware done ---`);
    } catch (error) {
      console.log('[expection there is no global middleware file');
    }

    // 注册 router
    rouetrLoader(app);
    console.log(`--- [start] registe router done ---`);

    // 启动服务
    try {
      const port = process.env.PORT || 8080;
      const host = process.env.IP || '0.0.0.0';
      app.listen(port, host, () => {
        console.log(`--- Server running on port: ${port} ---`);
      });
    } catch (error) {
      console.error(e);
    }

    return app;
  }
}