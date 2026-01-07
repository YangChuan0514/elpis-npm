const glob = require('glob');
const path = require('path');
const { sep } = path;

/**
 * middleware loader
 * @param {*} app koa实例
 * 
 * 加载所有middleware，通过 'app.middle.${目录).${文件}' 访问
 * 
 * 例子：
 *    app/middleware
 *       | -- custom-folder
 *                | -- custom-middleware.js
 * 
 * 加载 => app.middleware.customFolder.customMiddleware
 */
module.exports = (app) => {
  // 将所有中间件加载到 app.middlewares 下
  const middlerwares = {};
  // 读取 【eplis】中间件 app/middleware/**/*.js 所有文件
  const elpisMiddlerwarePath = path.resolve(__dirname, `..${sep}..${sep}app${sep}middlewares`);
  const elpisFileList = glob.sync(path.resolve(elpisMiddlerwarePath, `.${sep}**${sep}**.js`));
  elpisFileList.forEach(handleFile);

  // 读取 【业务代码根目录】中间件 app/middleware/**/*.js 所有文件
  const businessMiddlerwarePath = path.resolve(app.businessDir, `.${sep}middlewares`);
  const businessFileList = glob.sync(path.resolve(businessMiddlerwarePath, `.${sep}**${sep}**.js`));
  businessFileList.forEach(handleFile);

  function handleFile(filePath) {
    // 提取文件名称
    let name = path.resolve(filePath);

    // 截取路径 app/middlewares/custom-module/custom-middleware.js => custom-module/custom-middleware
    
    name = name.substring(name.lastIndexOf(`middlewares${sep}`) + `middlewares${sep}`.length, name.lastIndexOf('.'))

    // 把 中划线文件命名改为驼峰式
    name = name.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());

    // 挂载 middleware 到app实例上
    //  => 并且转化为 { customModule: { customMiddleware } } 对象嵌套的形式，后续可以通过a.b.c的语法调用
    let tempMiddlewares = middlerwares;
    const fileNames = name.split(sep);
    for (let i = 0; i < fileNames.length; i++) {
      if (i === fileNames.length - 1) {
        tempMiddlewares[fileNames[i]] = require(path.resolve(filePath))(app);
      } else {
        if (!tempMiddlewares[fileNames[i]]) {
          tempMiddlewares[fileNames[i]] = {};
        }
        tempMiddlewares = tempMiddlewares[fileNames[i]];
      }
    }
  }

  app.middlerwares = middlerwares;
}