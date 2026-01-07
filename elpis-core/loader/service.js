const glob = require('glob');
const path = require('path');
const { sep } = path;

/**
 * service loader
 * @param {*} app koa实例
 * 
 * 加载所有 service ，通过 'app.service.${目录).${文件}' 访问
 * 
 * 例子：
 *    app/service
 *       | -- custom-module
 *                | -- custom-service.js
 * 
 * 加载 => app.service.customModule.customService
 */
module.exports = (app) => {
  // 遍历所有文件，将所有中间件加载到 app.service 下
  const service = {};

  // 读取 elpis app/service/**/*.js 所有文件
  const elpisControllerPath = path.resolve(__dirname, `..${sep}..${sep}app${sep}service`);
  const elpisFileList = glob.sync(path.resolve(elpisControllerPath, `.${sep}**${sep}**.js`));
  elpisFileList.forEach(handleServiceFile);

  // 读取 业务 app/service/**/*.js 所有文件
  const businessControllerPath = path.resolve(app.businessDir, `.${sep}service`);
  const businessFileList = glob.sync(path.resolve(businessControllerPath, `.${sep}**${sep}**.js`));
  businessFileList.forEach(handleServiceFile);

  function handleServiceFile(file) {
    // 提取文件名称
    let name = path.resolve(file);

    // 截取路径 app/service/custom-module/custom-service.js => custom-module/custom-service
    name = name.substring(name.lastIndexOf(`service${sep}`) + `service${sep}`.length, name.lastIndexOf('.'))

    // 把 中划线文件命名改为驼峰式
    name = name.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());

    // 挂载 service 到 app 实例上
    //  => 并且转化为 { customModule: { customService } } 对象嵌套的形式，后续可以通过a.b.c的语法调用
    let tempService = service;
    const fileNames = name.split(sep); // [目录名称, 目录名称, service 文件]
    for (let i = 0; i < fileNames.length; i++) {
      if (i === fileNames.length - 1) { // 文件
        const ServiceModule = require(path.resolve(file))(app);
        tempService[fileNames[i]] = new ServiceModule();
      } else { // 文件夹 => 对应一层对象
        if (!tempService[fileNames[i]]) {
          tempService[fileNames[i]] = {};
        }
        tempService = tempService[fileNames[i]];
      }
    }
  }

  app.service = service;
}