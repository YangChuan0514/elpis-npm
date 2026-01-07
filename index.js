const ELpis = require('./elpis-core');
// 引入工程化构建方法
const FRBuildDev = require('./app/webpack/dev')
const FRBuildProd = require('./app/webpack/prod')

// ELpis.start({ name: '希腊女神', homePath: '/view/project-list' })

module.exports = {
  /**
   * 启动 elpis
   * @param {*} options 项目配置项，头传到 elpis 中
   * @returns koa app
   */
  startServer(options = { }) {
    const app = ELpis.start(options);
    return app;
  },
  /**
   * 编译前端工程
   * @param env 环境变量 - local/prod
   */
  buildFrontend(env) {
    if (env === 'local') {
      FRBuildDev();
    } else if (env == 'prod') {
      FRBuildProd();
    } else {
      console.error(`the env for buildFrontend is error, must be 'local' or 'prod'`);
    }
  },

  /**
   * 服务端基础类
   */
  Controller: {
    Base: require('./app/controller/base'),
  },
  Service: {
    Base: require('./app/service/base'),
  }
}