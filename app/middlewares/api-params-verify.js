const Ajv = require('ajv');
const ajv = new Ajv();

/**
 * API 参数校验 中间件
 * @param {object} app koa实例
 */
module.exports = (app) => {
  const $schema = "http://json-schema.org/draft-07/schema#";
  
  return async (ctx, next) => {
    // 只对 api 请求做校验，不处理页面html请求
    if (ctx.path.indexOf('/api/') < 0) {
      return await next();
    }

    const { path, method, params } = ctx;
    const { body, query, headers } = ctx.request;

    app.logger.info(`[${method} ${path}] headers: ${JSON.stringify(headers)}`);
    app.logger.info(`[${method} ${path}] params: ${JSON.stringify(params)}`);
    app.logger.info(`[${method} ${path}] query: ${JSON.stringify(query)}`);
    app.logger.info(`[${method} ${path}] body: ${JSON.stringify(body)}`);

    const schema = app.routerSchema?.[path]?.[`${method.toLowerCase()}`];
    
    if (!schema) {
      return await next();
    }

    let valid = true;

    // ajv 校验器
    let validator;

    // 校验 headers
    if (valid && headers && schema.headers) {
      schema.headers.$schema = $schema;
      validator = ajv.compile(schema.headers);
      valid = validator(headers);
    }

    // 校验 query
    if (valid && query && schema.query) {
      schema.query.$schema = $schema;
      validator = ajv.compile(schema.query);
      valid = validator(query);
    }

    // 校验 body
    if (valid && body && schema.body) {
      schema.body.$schema = $schema;
      validator = ajv.compile(schema.body);
      valid = validator(body);
    }

    // 校验 params
    if (valid && params && schema.params) {
      schema.params.$schema = $schema;
      validator = ajv.compile(schema.params);
      valid = validator(params);
    }
    
    if (!valid) {
      ctx.status = 200;
      ctx.body = {
        success: false,
        message: `request validate fail: ${ajv.errorsText(validator.errors)}`,
        code: 442
      }
      return;
    }

    await next()
  }
}