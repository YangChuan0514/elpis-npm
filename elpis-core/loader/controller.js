const glob = require('glob');
const path = require('path');
const { sep } = path;

/**
 * controller loader
 * @param {*} app koa实例
 * 
 * 加载所有 controller ，通过 'app.controller.${目录).${文件}' 访问
 * 
 * 例子：
 *    app/controller
 *       | -- custom-module
 *                | -- custom-controller.js
 * 
 * 加载 => app.controller.customModule.customController
 */
module.exports = (app) => {
  // 将所有中间件加载到 app.controller 下
  const controller = {};

  // 读取 elpis 的 app/controller/**/*.js 所有文件
  const elpisControllerPath = path.resolve(__dirname, `..${sep}..${sep}app${sep}controller`);
  const elpisFileList = glob.sync(path.resolve(elpisControllerPath, `.${sep}**${sep}**.js`));
  elpisFileList.forEach(handleController);

  // 读取 业务代码的 的 app/controller/**/*.js 所有文件
  const businessControllerPath = path.resolve(app.businessDir, `.${sep}controller`);
  const businessFileList = glob.sync(path.resolve(businessControllerPath, `.${sep}**${sep}**.js`));
  businessFileList.forEach(handleController);

  function handleController(file) {
    // 提取文件名称
    let name = path.resolve(file);

    // 截取路径 app/controller/custom-module/custom-controller.js => custom-module/custom-controller
    name = name.substring(name.lastIndexOf(`controller${sep}`) + `controller${sep}`.length, name.lastIndexOf('.'))

    // 把 中划线文件命名改为驼峰式
    name = name.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());

    // 挂载 controller 到 app 实例上
    //  => 并且转化为 { customModule: { customController } } 对象嵌套的形式，后续可以通过a.b.c的语法调用
    let tempController = controller;
    const fileNames = name.split(sep); // [目录名称, 目录名称, controller文件]
    for (let i = 0; i < fileNames.length; i++) {
      if (i === fileNames.length - 1) { // 文件
        const ControllerModule = require(path.resolve(file))(app);
        tempController[fileNames[i]] = new ControllerModule();
      } else { // 文件夹 => 对应一层对象
        if (!tempController[fileNames[i]]) {
          tempController[fileNames[i]] = {};
        }
        tempController = tempController[fileNames[i]];
      }
    }
  }

  app.controller = controller;
}