const path = require('path');

module.exports = (app) => {
  // 静态资源托管
  const koaStatic = require('koa-static');
  // const etag = require('koa-etag');
  // const compress = require('koa-compress');
  // const zlib = require('zlib');

  // 压缩
  // app.use(compress({
  //   threshold: 2048, // 只压缩大于 2KB 的资源
  //   gzip: {
  //     flush: zlib.constants.Z_SYNC_FLUSH // gzip 快速刷新模式
  //   },
  //   deflate: {
  //     flush: zlib.constants.Z_SYNC_FLUSH,
  //   },
  //   br: false // 禁用 Brotli（需 Node.js 12+ 支持）
  // }));

  // app.use(etag()); // 放在 static 中间件之前
  // 缓存时间常量（单位：毫秒）
  // const CACHE = {
  //   LONG: 365 * 24 * 60 * 60 * 1000, // 1年（适合带哈希的文件）
  //   SHORT: 1 * 60 * 1000, // 1分钟（适合无哈希文件）
  //   NONE: 0 // 不缓存
  // };

  // 优先从业务代码中取

  // app.use(koaStatic(path.resolve(process.cwd(), './app/public'), {
  //   maxage: CACHE.LONG, // 默认长期缓存
  //   gzip: true, // 自动使用预生成的 .gz 文件（需配合构建工具）
  //   brotli: false, // 禁用 brotli（需要 nginx 支持时再开启）
  //   setHeaders: (res, filePath) => {
  //     // 根据文件类型设置 Content-Type
  //     // if (filePath.endsWith('.css')) {
  //     //   res.setHeader('Content-Type', 'text/css');
  //     // } else if (filePath.endsWith('.js')) {
  //     //   res.setHeader('Content-Type', 'application/javascript');
  //     // }
  //     if (/\.(js|css)$/.test(filePath)) {
  //       // 告诉浏览器当前压缩方式（重要！）
  //       res.setHeader('Content-Encoding', 'gzip');
  //     }
  
  //     // 按文件特征动态调整缓存策略
  //     if (filePath.includes('no-cache')) {
  //       // 场景1：特定文件不缓存（如 index.html）
  //       res.setHeader('Cache-Control', 'no-store');
  //     } else if (!filePath.match(/\_[a-f0-9]{8}\./)) {
  //       // 场景2：无哈希文件短期缓存（如 lib.js）
  //       res.setHeader('Cache-Control', `public, max-age=${CACHE.SHORT / 1000}`);
  //     } else {
  //       // 场景3：带哈希文件长期缓存（如 app.a1b2c3.js）
  //       res.setHeader('Cache-Control', `public, max-age=${CACHE.LONG / 1000}, immutable`);
  //     }
  
  //     // 协商缓存相关（Last-Modified 默认由 koa-static 生成）
  //     if (process.env.NODE_ENV === 'development') {
  //       res.setHeader('Cache-Control', 'no-cache'); // 开发环境禁用缓存
  //     }
  //   }
  // }));
  // app.use(koaStatic(path.resolve(__dirname, './public'), {
  //   maxage: CACHE.LONG, // 默认长期缓存
  //   setHeaders: (res, filePath) => {
  //     if (/\.(js|css)$/.test(filePath)) {
  //       // 告诉浏览器当前压缩方式（重要！）
  //       res.setHeader('Content-Encoding', 'gzip');
  //     }
  
  //     // 按文件特征动态调整缓存策略
  //     if (filePath.includes('no-cache')) {
  //       // 场景1：特定文件不缓存（如 index.html）
  //       res.setHeader('Cache-Control', 'no-store');
  //     } else if (!filePath.match(/\_[a-f0-9]{8}\./)) {
  //       // 场景2：无哈希文件短期缓存（如 lib.js）
  //       res.setHeader('Cache-Control', `public, max-age=${CACHE.SHORT / 1000}`);
  //     } else {
  //       // 场景3：带哈希文件长期缓存（如 app.a1b2c3.js）
  //       res.setHeader('Cache-Control', `public, max-age=${CACHE.LONG / 1000}, immutable`);
  //     }
  
  //     // 协商缓存相关（Last-Modified 默认由 koa-static 生成）
  //     if (process.env.NODE_ENV === 'development') {
  //       res.setHeader('Cache-Control', 'no-cache'); // 开发环境禁用缓存
  //     }
  //   }
  // }));

  // 模块引擎
  
  app.use(koaStatic(path.resolve(process.cwd(), './app/public')));
  app.use(koaStatic(path.resolve(__dirname, './public')));

  // 模块渲染
  const koaNunjucks = require('koa-nunjucks-2');
  app.use(koaNunjucks({
    ext: 'tpl',
    path: path.resolve(process.cwd(), './app/public'),
    nunjucksConfig: {
      noCache: true,
      trimBlocks: true,
    }
  }));

  // 请求 body 解析中间件
  const bodyParser = require('koa-bodyparser');
  app.use(bodyParser({
    formLimit: '1000mb',
    enableTypes: ['form', 'text', 'json']
  }))

  // 全局错误中间件
  app.use(app.middlerwares.errorHandler);

  // 签名合法性校验 中间件
  app.use(app.middlerwares.apiSignVerify);

  // 参数校验中间件
  app.use(app.middlerwares.apiParamsVerify);

  // 项目处理中间件
  app.use(app.middlerwares.projectHandler);
}