module.exports = (app) => {
  return class ViewController {
    /**
     * 渲染页面方法
     * @param {上下文} ctx 
     */
    async renderPage(ctx) {
      const { query, params } = ctx;
      app.logger.info(`[ViewCOntroller] query: ${JSON.stringify(query)}`);
      app.logger.info(`[ViewCOntroller] params: ${JSON.stringify(params)}`);

      return ctx.render(`dist/entry.${ctx.params.page}`, {
        title: app.options?.title || 'elpis-app',
        projKey: query?.proj_key,
        name: app.options?.name,
        env: app.env.get(),
        options: JSON.stringify(app.options)
      })
    }
  }
}