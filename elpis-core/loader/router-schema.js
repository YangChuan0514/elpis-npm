const glob = require('glob');
const path = require('path');
const { sep } = path;

/**
 * router-schema loader
 * @param {*} app koa实例
 * 
 * 通过 'json-schema & ajv' 对 API 规则进行约束，配合 api-params-verify 中间件使用
 * 
 * app\router-schema\**\**.js
 * 
 * 输出：
 * app.routerSchema = {
 *  '${api1}': ${jsonSchema},
 *  '${api2}': ${jsonSchema},
 *  '${api3}': ${jsonSchema},
 *  '${api4}': ${jsonSchema},
 * }
 */
module.exports = (app) => {
  // 注册所有 router-schema，使得可以通过'app.routerSchema.api'访问
  let routerSchema = {};

  // elpis router schema
  const elpisRouterSchemaPath = path.resolve(__dirname, `..${sep}..${sep}app${sep}router-schema`);
  const elpisFileList = glob.sync(path.resolve(elpisRouterSchemaPath, `.${sep}**${sep}**.js`));
  elpisFileList.forEach(handleRouterSchema);

  // business router schema
  const businessRouterSchemaPath = path.resolve(app.businessDir, `.${sep}router-schema`);
  const businessFileList = glob.sync(path.resolve(businessRouterSchemaPath, `.${sep}**${sep}**.js`));
  businessFileList.forEach(handleRouterSchema);
  // 收集所有的 router schema
  function handleRouterSchema(filePath) {
    routerSchema = {
      ...routerSchema,
      ...require(filePath)
    }
  }

  app.routerSchema = routerSchema;
}