const glob = require('glob');
const path = require('path');
const { sep } = path;

/**
 * extend loader
 * @param {*} app koa实例
 * 
 * 加载所有 extend ，通过 'app.extend.${文件}' 访问
 * 
 * 例子：
 *    app/extend
 *       | -- custom-extend.js
 * 
 * 加载 => app.extend.customExtend
 */
module.exports = (app) => {
  // 读取 elpis app/extend/*.js 所有文件
  const elpisExtendPath = path.resolve(__dirname, `..${sep}..${sep}app${sep}extend`);
  const elpisFileList = glob.sync(path.resolve(elpisExtendPath, `.${sep}**${sep}**.js`));
  // 将所有 extend 加载到 app 下
  elpisFileList.forEach(handleExtendFile);

  // 读取 业务 app/extend/*.js 所有文件
  const controllerPath = path.resolve(app.businessDir, `.${sep}extend`);
  const fileList = glob.sync(path.resolve(controllerPath, `.${sep}**${sep}**.js`));
  fileList.forEach(handleExtendFile);

  function handleExtendFile(filePath) {
    // 提取文件名称
    let name = path.resolve(filePath);

    // 截取路径 app/extend/custom-extend.js => custom-extend
    name = name.substring(name.lastIndexOf(`extend${sep}`) + `extend${sep}`.length, name.lastIndexOf('.'))

    // 把 中划线文件命名改为驼峰式
    name = name.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());

    // 过滤 app 的属性方法重名的情况
    for (const key in app) {
      if (key === name) {
        console.log(`[extend loader] name:${name} is already in app`);
        return;
      }
    }

    // 挂载 extend 到 app 实例上 => 通过 app.customExtend 访问
    app[name] = require(path.resolve(filePath))(app);
  }
}