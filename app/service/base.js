const superagent = require('superagent');

module.exports = (app) => class BaseService {
  /**
   * service 基类
   * 统一收拢 service 公共属性、方法
   */
  constructor() {
    this.app = app;
    this.config = app.config;
    this.curl = superagent;
  }
}