module.exports = (app) => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      // 错误处理
      const { status, message, detail } = err;
      app.logger.info(JSON.stringify(err));
      app.logger.error('[-- exception --]:', err);
      app.logger.error('[-- exception --]:', status, message, detail);

      if (message && message.indexOf('template not found') > -1) {
        // 进行页面重定向 慎用301永久重定向
        ctx.status = 302; // 临时重定向
        ctx.redirect(`${app.options?.homePath}`);
        return;
      }

      const respBody = {
        success: false,
        code: 50000,
        message: '网络异常，请稍后重试'
      }

      ctx.status = 200;
      ctx.body = respBody;
    }
  }
}