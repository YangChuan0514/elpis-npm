const KoaRouter = require('koa-router');
const glob = require('glob');
const path = require('path');
const { sep } = path;

/**
 * router loader
 * @param {*} app koa实例
 * 
 * 解析所有 app\router\**\**.js文件, 注册到 KoaRouter 中
 */
module.exports = (app) => {
  // 实例化 KoaRouter
  const koaRouter = KoaRouter();

  // 找到 elpis 路由文件路径
  const elpisRouterPath = path.resolve(__dirname, `..${sep}..${sep}app${sep}router`)
  // 注册 elpis 路由
  const elpisFileList = glob.sync(path.resolve(elpisRouterPath, `.${sep}**${sep}**.js`));
  elpisFileList.forEach((filePath) => {
    require(path.resolve(filePath))(app, koaRouter);
  });

  // 找到 业务 路由文件路径
  const businessRouterPath = path.resolve(app.businessDir, `.${sep}router`)
  // 注册 业务 路由
  const fileList = glob.sync(path.resolve(businessRouterPath, `.${sep}**${sep}**.js`));
  fileList.forEach((filePath) => {
    require(path.resolve(filePath))(app, koaRouter);
  });

  // 路由兜底
  koaRouter.get('(.*)', async (ctx, next) => {
    ctx.status = 302;
    ctx.redirect(app?.options?.homePath ?? '/');
  })

  // 路由注册到app
  app.use(koaRouter.routes());
  app.use(koaRouter.allowedMethods());
}