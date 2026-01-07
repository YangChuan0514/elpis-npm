import { createApp } from 'vue';

// ElementPlus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// import 'element-plus/theme-chalk/index.css';
// import 'element-plus/theme-chalk/dark/css-vars.css';
// pinia
import pinia from '@elpisStore';
// 路由
import { createRouter, createWebHistory } from 'vue-router';

// 全局样式
import './assets/custom.css';

// import registryElementPlus from  './registry-element-plus.js';

/**
 * 应用主入口 启动多个入口
 * @param {Object} pageComponent 页面入口组件
 * @param {Object} options 配置项
 *  - {Array} routes 路由配置
 *  - {String} routerMode 路由模式 hash | history | abstract
 *  - {Array} libs 需要加载的库
 */
export default (pageComponent, options) => {
  const { routes, libs } = options || {};

  const app = createApp(pageComponent);
  
  app.use(ElementPlus); // 注册 饿了么 UI
  // registryElementPlus(app);

  // 加载第三方库
  if (libs && libs?.length > 0) {
    try {
      for (let i = 0; i < libs.length; i++) {
        app.use(libs[i]);
      }
    } catch (error) {
      console.error(`加载第三方库失败: ${error}`);
    }
  }

  app.use(pinia); // 注册 pinia

  // 页面路由
  if (routes && routes?.length > 0) {
    // if (['hash', 'history', 'abstract'].indexOf(routerMode) === -1) {
    //   console.error(`routerMode must be one of 'hash'|'history'|'abstract'`);
    //   app.mount('#root');
    //   return;
    // }
    // const map = {
    //   'hash': createWebHashHistory,
    //   'history': createWebHistory,
    //   'abstract': createMemoryHistory,
    // }
    const router = createRouter({
      history: createWebHistory(), // 统一使用 history 模式
      routes,
    });
    app.use(router);
    router.isReady().then(() => {
      app.mount('#root');
    })
  } else {
    app.mount('#root');
  }
};
