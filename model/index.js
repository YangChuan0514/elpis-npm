// 模型解析器

const path = require('path');
const glob = require('glob');
const _ = require('lodash');
const { sep } = path;

/**
 * 项目模型扩展 => project 继承 model
 */
const projExtenModel = (model, project) => {
  return _.mergeWith({}, model, project, (modelValue, projValue) => {
    // 处理数组合并特殊情况
    if (Array.isArray(modelValue) && Array.isArray(projValue)) {
      let res = [];
      // 处理 proj 继承后，修改、新增的情况
      // model中有的键值，project中也有，则修改（重载）
      // model中没有的键值，project中有，则新增（拓展）
      // model中有的键值，project中没有，则保留（继承）

      // 修改 | 继承
      for (let i = 0; i < modelValue.length; i++) {
        const modelItem = modelValue[i];
        const projItem = projValue.find(item => item.key === modelItem.key);
        // proj 中 和 model 中都有，则递归合并
        res.push(projItem ? projExtenModel(modelItem, projItem) : modelItem);
      }

      // 新增
      for (let i = 0; i < projValue.length; i++) {
        const projItem = projValue[i];
        const modelItem = modelValue.find(item => item.key === projItem.key);
        // proj 中有、model中没有，则新增
        if (!modelItem) {
          res.push(projItem);
        }
      }

      return res;
    }
  })
}

/**
 * 解析 model 配置：继承并组装数据
 * [{
 *   modelKey: ${model},
 *   project: [
 *     pro1Key: ${pro1},
 *     pro2Key: ${pro2}
 *   ]
 * }]
 */
module.exports = function (app) {
  const modelList = [];

  // 遍历业务项目根目录model文件夹，构造模型数据，挂载到 modelList
  const modelPath = path.resolve(process.cwd(), `.${sep}model`);
  const filePathList = glob.sync(path.resolve(modelPath, `.${sep}**${sep}**.js`));

  filePathList.forEach((filePath) => {
    filePath = path.normalize(filePath);

    if (filePath.includes('index.js')) return;

    // 区分配置类型 model | project
    const type = filePath.includes(`${sep}project${sep}`) ? 'project' : 'model';
    
    if (type === 'project') {
      const modelKey = filePath.match(/model[\\/](.*?)[\\/]project/)?.[1];
      const projKey = filePath.match(/[\\/]project[\\/](.*?)\.js/)?.[1];

      let modelItem = modelList.find(item => item.model?.key === modelKey);
      if (!modelItem) {
        modelItem = {};
        modelList.push(modelItem);
      }
      if (!modelItem.project) { // 没有 project 字段，则创建
        modelItem.project = {};
      }
      modelItem.project[projKey] = require(path.resolve(filePath));
      modelItem.project[projKey].key = projKey;
      modelItem.project[projKey].modelKey = modelKey;
    }
    if (type === 'model') {
      const modelKey = filePath.match(/model[\\/](.*?)[\\/]model\.js/)?.[1];
      let modelItem = modelList.find(item => item.model?.key === modelKey);
      if (!modelItem) {
        modelItem = {};
        modelList.push(modelItem);
      }
      modelItem.model = require(path.resolve(filePath));
      modelItem.model.key = modelKey;
    }
  })

  // project 继承 model
  modelList.forEach(modelItem => {
    const { model, project } = modelItem;
    for (const key in project) {
      project[key] = projExtenModel(model, project[key]);
    }
  });
  
  return modelList;
}