const log4js = require('log4js')

/**
 * 日志工具
 * 调用方式 app.logger.info app.logger.warn app.logger.error
 */
module.exports = (app) => {
  let logger;
  if (app.env.isLocal()) {
    logger = console;
  } else {
    log4js.configure({
      appenders: {
        console: {
          type: 'console',
        },
        // 日志文件切割
        dateFile: {
          type: 'dateFile',
          filename: './log/application.log',
          pattern: '.yyyy-MM-dd'
        }
      },
      categories: {
        default: {
          appenders: ['console', 'dateFile'],
          level: 'trace'
        }
      }
    });
    logger = log4js.getLogger();
  }
  return logger;
}