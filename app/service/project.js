module.exports = (app) => {
  const BaseService = require('./base')(app);
  /**
   * modelList: [
   *  {
   *    model: {name, key},
   *    project: {
   *      pro_a: {name, key, desc},
   *      pro_b: {name, key, desc},
   *    }
   *  }
   * ]
   */
  const modelList = require('../../model/index')(app);
  return class ProjectService extends BaseService {
    /**
     * 获取 proj_key 的项目
     */
    get({ projKey }) {
      const targetProject = modelList.find((item) => item.project[projKey])?.project[projKey];
      return targetProject;
    }
    /**
     * 获取 projKey 对应的同级的项目列表（如无 projKey，全量取项目列表）
     */
    getProjectList({ projKey }) {
      // const projectList = [];
      // modelList.forEach(({ model, project }) => {
      //   if (projKey && !project[projKey]) { return; }
      //   for (const pKey in project) {
      //     projectList.push(project[pKey]);
      //   }
      // })
      const projectList = modelList.reduce((preProjectList, modelItem) => {
        const { project } = modelItem;
        // 有传入 projKey 只查同级 project
        if (projKey && !project[projKey]) { return preProjectList; }
        for (const pKey in project) {
          preProjectList.push(project[pKey]);
        }
        return preProjectList;
      }, []);

      return projectList;
    }
    /**
     * 获取 model list
     */
    getModelList() {
      return modelList;
    }
  }
}