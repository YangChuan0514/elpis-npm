module.exports = (app, router) => {
  const { view: viewController } = app.controller;
  // 用户输入 https://xxx:port/view/123，即可渲染 /view/123
  router.get('/view/:page', viewController.renderPage.bind(viewController));
  // 用户输入 https://xxx:port/view/xxx/xxx，即可渲染 /view/xxx
  router.get('/view/:page/*', viewController.renderPage.bind(viewController));
}