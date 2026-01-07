module.exports = (app) => {
  const BaseController = require('./base')(app);
  return class ProjectController extends BaseController {
    /**
     * 获取 proj_key 的项目
     */
    async get(ctx) {
      const { proj_key: projKey } = ctx.query;
      const { project: projectService } = app.service;
      const project = await projectService.get({ projKey });
      
      if (!project) {
        this.fail(ctx, '获取项目配置异常！', 50000);
        return;
      }
      // 组装数据
      const dtoProject = { ...project };
      // 返回给前端
      this.success(ctx, dtoProject);
    }
    /**
     * 获取 proj_key 的项目及其同级的项目列表（未传proj_key则查所有的项目）
     */
    async getProjectList(ctx) {
      const { proj_key: projKey } = ctx.query;
      const { project: projectService } = app.service;
      // 调用服务
      const projectList = await projectService.getProjectList({ projKey });
      // 返参处理 - 返回必要的参数即可，避免数据冗余
      const dtoProjectList = projectList.map((projectItem) => {
        const { name, key, desc, modelKey, homePage } = projectItem;
        return { name, key, desc, modelKey, homePage };
      });
      // 返回给前端
      this.success(ctx, dtoProjectList);
    }
    /**
     * 获取所有的模型与项目的结构化数据
     */
    async getModelList(ctx) {
      const { project: projectService } = app.service;
      const modelList = await projectService.getModelList();
      
      // 构造返回结果，返回必要的数据
      const dtoModelList = modelList.reduce((preList, item) => {
        const { model, project } = item;

        // 构造 model 必要数据
        const { name, key, desc } = model;
        const dtoModel = { name, key, desc };

        // 构造 project 必要数据
        // const dtoProject = {};
        // for (const proKey in project) {
        //   const { key, name, desc, homePage } = project[proKey];
        //   dtoProject[proKey] = { key, name, desc, homePage };
        // }
        const dtoProject = Object.keys(project).reduce((preObj, proKey) => {
          const { key, name, desc, homePage } = project[proKey];
          preObj[proKey] = { key, name, desc, homePage };
          return preObj;
        }, {});

        preList.push({
          model: dtoModel,
          project: dtoProject
        })

        return preList;
      }, []);

      this.success(ctx, dtoModelList);
    }
  }
}