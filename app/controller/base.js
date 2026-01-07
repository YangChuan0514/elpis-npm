module.exports = (app) => class BaseController {
  /**
   * controller 基类
   * 统一收拢 controller 公共属性、方法
   */
  constructor() {
    this.app = app;
    this.config = app.config;
  }

  /**
   * API 处理成功反参
   * @param {object} ctx 上下文
   * @param {{}} [data={}] 反参
   * @param {{}} [metadata={}] 附加数据
   */
  success(ctx, data = {}, metadata = {}) {
    ctx.status = 200;
    ctx.body = {
      success: true,
      data,
      metadata
    }
  }

  /**
   * API 处理失败反参
   * @param {object} ctx 上下文
   * @param {{}} [message] 反参
   * @param {{}} [code] 
   */
    fail(ctx, message, code) {
      ctx.body = {
        success: false,
        message,
        code
      }
    }
}