const MD5 = require("md5");

/**
 * API 签名合法性校验 中间件
 * @param {*} app 
 */
module.exports = (app) => {
  return async (ctx, next) => {
    // 白名单
    if (app.config?.apiSignVerify?.whiteList?.includes(ctx.path)) {
      await next();
      return 
    }


    // 只对 api 请求做校验，不处理页面html请求
    if (ctx.path.indexOf('/api/') < 0) {
      return await next()
    }
    // return await next()

    const { path, method } = ctx;
    const { headers } = ctx.request;
    const { s_sign: sSign, s_t: st } = headers;
    const time = 600 * 1000; // 签名有效期

    const signatrue = MD5(`${app.config.apiSignKey}_${st}`);

    app.logger.info(`[${method} ${path}] signature: ${signatrue}`);

    if (!sSign || !st || signatrue !== sSign.toLowerCase() || Date.now() - st > time) {
      ctx.status = 200;
      ctx.body = {
        success: false,
        message: 'signature error',
        code: 445
      }
      return;
    }

    await next()
  }
}