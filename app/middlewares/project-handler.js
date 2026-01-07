/**
 * 项目相关参数处理中间件
 */
module.exports = (app) => {
  return async (ctx, next) => {
    // 只对业务 api 进行处理
    if (ctx.path.indexOf('/api/proj/') < 0) {
      return await next();
    }

    const { proj_key: projKey } = ctx.headers;

    if (!projKey) {
      ctx.status = 200;
      ctx.body = {
        success: false,
        message: 'proj_key not found',
        code: 446
      }
      return;
    }

    ctx.projKey = projKey;

    await next()
  }
}