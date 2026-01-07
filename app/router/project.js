module.exports = (app, router) => {
  const { project: projectController } = app.controller;
  router.get('/api/project', projectController.get.bind(projectController));
  router.get('/api/project/list', projectController.getProjectList.bind(projectController));
  router.get('/api/project/model_list', projectController.getModelList.bind(projectController));
}