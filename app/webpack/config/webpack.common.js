const fs = require('fs');
const path = require("path");
const glob = require('glob');
const webpack = require('webpack');
const merge = require('webpack-merge');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { sep } = path;
const defaultConfig = require(path.resolve(`${process.cwd()}/config/config.default.js`));
const currentEnviromnentConfig = require(path.resolve(`${process.cwd()}/config/config.${process.env._ENV || 'default'}.js`));
let config = { ...defaultConfig, ...currentEnviromnentConfig };
(function () {
  config = Object.keys(config).reduce((obj, key) => {
    const value = config[key];
    if (typeof value === 'string') {
      obj[key] = `"${value}"`;
    } else if (typeof value === 'object') {
      obj[key] = `${JSON.stringify(value)}`;
    } else {
      obj[key] = `${value}`;
    }
    return obj;
  }, {});
})();

// elpis 所有页面的入口
const elpisPageEntries = {};
// elpis 所有页面的 html 插件配置
const elpisHtmlWebpackPluginList = [];
// 获取 elpis app/pages 目录下所有的入口文件(entry.qqq.js)
const elpisEntryFileList = path.resolve(__dirname, '../../pages/**/entry.*.js');
glob.sync(elpisEntryFileList).forEach(file => {
  hanldeEntryAndHtmlWebpackPlugin(file, elpisPageEntries, elpisHtmlWebpackPluginList);
});

// 业务 所有页面的入口
const businessPageEntries = {};
// 业务 所有页面的 html 插件配置
const businessHtmlWebpackPluginList = [];
// 获取 业务 app/pages 目录下所有的入口文件(entry.qqq.js)
const businessEntryFileList = path.resolve(process.cwd(), './app/pages/**/entry.*.js');
glob.sync(businessEntryFileList).forEach(file => {
  hanldeEntryAndHtmlWebpackPlugin(file, businessPageEntries, businessHtmlWebpackPluginList);
});

// 处理 entry 文件 和 htmlwebpackplugin 插件
function hanldeEntryAndHtmlWebpackPlugin(file, entries = {}, htmlWebpackPluginList = []) {
  const entryFileName = path.basename(file, '.js');
  // 构造 entry
  entries[entryFileName] = file;
  // 构造最终渲染的页面文件
  htmlWebpackPluginList.push(new HtmlWebpackPlugin({
    // 产物（模板）
    template: path.resolve(__dirname, '../../views/entry.tpl'),
    // 输出 html 文件名
    filename: path.resolve(process.cwd(), './app/public/dist/', `${entryFileName}.tpl`),
    // 要注入的代码块
    chunks: [ entryFileName ]
  }))
}

// 加载 业务 webpack 配置
let businessWebpackConfig;

try {
  businessWebpackConfig = require(`${process.cwd()}${sep}app${sep}webpack${sep}webpack.config.js`);
} catch (error) {
  console.log('no business webpack.config.js file', error);
}

/**
 * webpack 基础配置
 */
module.exports = merge.smart({
  // 入口
  // entry: {
  //   'entry.page1': path.resolve(process.cwd(), './app/pages/page1/entry.page1.js'),
  //   'entry.page2': path.resolve(process.cwd(), './app/pages/page2/entry.page2.js'),
  // },
  entry: Object.assign({}, elpisPageEntries, businessPageEntries),
  // 输出产物路径配置
  output: {},
  // 模块解析配置，解析规则：什么文件由什么解析器解析
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [ require.resolve('vue-loader') ]
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, '../../pages'), // elpis 
          path.resolve(process.cwd(), './app/pages'), // 业务
        ],
        use: [ require.resolve('babel-loader') ]
      },
      {
        test: /\.(png|jpe?g|gif|webp|)(\?.+)?$/,
        use: [
          {
            loader: require.resolve('url-loader'),
            options: {
              limit: 3000,
              esModule: false,
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [require.resolve('style-loader'), require.resolve('css-loader')],
      },
      {
        test: /\.less$/,
        use: [require.resolve('style-loader'), require.resolve('css-loader'), require.resolve('less-loader')],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        use: require.resolve('file-loader')
      }
    ]
  },

  // 插件
  plugins: [
    // 处理 .vue 文件，作用：将定义好的规则复制并应用到 .vue 文件中
    // 例如，/.js$/ 的规则，会应用到 .vue 文件中的 script 板块... style temple板块也是如此
    new VueLoaderPlugin(),
    // 把第三方库暴露到 window context 中
    new webpack.ProvidePlugin({
      Vue: 'vue',
      axios: 'axios',
      _: 'lodash'
    }),
    // 将全局常量注入到 window 的环境中
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: 'true', // 支持 vue 解析 optionApi
      __VUE_PROD_DEVTOOLS__: 'false', // 禁用 Vue 调试工具
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false', // 禁用 水合 信息
      ...config
    }),
    ...elpisHtmlWebpackPluginList,
    ...businessHtmlWebpackPluginList,
    // // 构造最终渲染的页面模板 - tpl
    // new HtmlWebpackPlugin({
    //   // 产物（模板）
    //   template: path.resolve(process.cwd(), './app/views/entry.tpl'),
    //   filename: path.resolve(process.cwd(), './app/public/dist/', 'entry.page1.tpl'),
    //   // 要注入的代码块
    //   chunks: ['entry.page1']
    // }),
    // new HtmlWebpackPlugin({
    //   // 产物（模板）
    //   template: path.resolve(process.cwd(), './app/views/entry.tpl'),
    //   filename: path.resolve(process.cwd(), './app/public/dist/', 'entry.page2.tpl'),
    //   // 要注入的代码块
    //   chunks: ['entry.page2']
    // })
  ],

  // 打包优化 - 代码分割、缓存、压缩、treeshaking
  optimization: {
    /**
     * js分为三种类型：
     * 公共三方库vendor，基本不会改动
     * 业务公共代码common，改动较少
     * 业务代码entry.{page}，不同业务代码的差异部分，持续改动
     * 目的：将改动和引用频率不同的 js 区分处理，可以合理利用浏览器缓存
     */
    splitChunks: {
      chunks: 'all', // 同步和异步模块都会进行分割
      maxAsyncRequests: 10, // 每次异步加载的最大请求数
      maxInitialRequests: 10, // 入口点的最大请求数
      cacheGroups: {
        elementui: {
          test: /[\\/]node_modules[\\/]element-plus[\\/]/,
          name: 'elementui',
          priority: 30,
          enforce: true,
          reuseExistingChunk: true, // 复用已用的公共 chunk
        },
        vendor: { // 第三方模块
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 20,
          enforce: true,
          reuseExistingChunk: true, // 复用已用的公共 chunk
        },
        common: { // 公共模块
          test: /[\\/]widgets|common[\\/]/,
          name: 'common',
          minChunks: 2, // 最少两个模块引用
          minSize: 1, // 最小分割文件大小（示例：1 byte）
          priority: 10,
          reuseExistingChunk: true, // 复用已用的公共 chunk
        },
      }
    },
    // 将 webpack 运行时生产的代码提取到公共包 runtime.js 中
    runtimeChunk: true,
  },
  
  // 配置模块解析的具体行为（定义 webpack 打包时，如何找到解析具体模块的路径-规则）
  resolve: {
    extensions: ['.js', '.vue', '.less', '.css'],
    alias: (() => {
      const aliasMap = {};
      const blankModulePath = path.resolve(__dirname, '../libs/blank.js');

      // 路由扩展配置
      const businessDashboradRouterConfig = path.resolve(process.cwd(), './app/pages/dashboard/router.js');
      aliasMap['@businessDashboradRouterConfig']
        = fs.existsSync(businessDashboradRouterConfig) ? businessDashboradRouterConfig : blankModulePath;

      // schema-view动态组件拓展配置
      const businessComponentConfig
        = path.resolve(process.cwd(), './app/pages/dashboard/complex-view/schema-view/components/component-config.js');
      aliasMap['@businessComponentConfig']
        = fs.existsSync(businessComponentConfig) ? businessComponentConfig : blankModulePath;

      // 业务基础组件配置
      const businessFormItemConfig
        = path.resolve(process.cwd(), './app/pages/widgets/schema-form/form-item-config.js');
      aliasMap['@businessFormItemConfig']
        = fs.existsSync(businessFormItemConfig) ? businessFormItemConfig : blankModulePath;

      // 业务schema-search-bar 组件拓展配置
      const businessSearchItemConfig
        = path.resolve(process.cwd(), './app/pages/widgets/schema-search-bar/search-item.config.js');
      aliasMap['@businessSearchItemConfig']
        = fs.existsSync(businessSearchItemConfig) ? businessSearchItemConfig : blankModulePath;

      // 业务 header-container 组件拓展配置
      const headerContainerConfig
        = path.resolve(process.cwd(), './app/pages/widgets/header-container/header-container.config.js');
      aliasMap['@headerContainerConfig']
        = fs.existsSync(headerContainerConfig) ? headerContainerConfig : blankModulePath;
        
      // 业务 header-container 组件拓展配置
      const businessElementComponents
        = path.resolve(process.cwd(), './app/pages/element-components.config.js');
      aliasMap['@businessElementComponents']
        = fs.existsSync(businessElementComponents) ? businessElementComponents : blankModulePath;

      return {
        "vue": require.resolve('vue'),
        "vue-router": require.resolve('vue-router'),
        "pinia": require.resolve('pinia'),
        // "@babel/runtime/regenerator": require.resolve('@babel/runtime/regenerator'),
        // "@babel/runtime/helpers/asyncToGenerator": require.resolve('@babel/runtime/helpers/asyncToGenerator'),
        // "@babel/runtime/helpers/defineProperty": require.resolve('@babel/runtime/helpers/defineProperty'),
        "@elpisPages": path.resolve(__dirname, '../../pages'),
        "@elpisCommon": path.resolve(__dirname, '../../pages/common'),
        "@elpisWidgets": path.resolve(__dirname, '../../pages/widgets'),
        "@elpisHeaderContainer": path.resolve(__dirname, '../../pages/widgets/header-container/header-container.vue'),
        "@elpisSchemaSearchBar": path.resolve(__dirname, '../../pages/widgets/schema-search-bar/schema-search-bar.vue'),
        "@elpisSchemaTable": path.resolve(__dirname, '../../pages/widgets/schema-table/schema-table.vue'),
        "@elpisSiderContainer": path.resolve(__dirname, '../../pages/widgets/sider-container/sider-container.vue'),
        "@elpisSchemaForm": path.resolve(__dirname, '../../pages/widgets/schema-form/schema-form.vue'),
        "@elpisStore": path.resolve(__dirname, '../../pages/store'),
        "@elpisCurl": path.resolve(__dirname, '../../pages/common/curl.js'),
        "@elpisUtls": path.resolve(__dirname, '../../pages/common/utils.js'),
        "@elpisBoot": path.resolve(__dirname, '../../pages/boot.js'),
        "@businessSearchItemConfig": path.resolve(__dirname, '../../pages/widgets/schema-search-bar/search-item.config.js'),
        "@businessFormItemConfig": path.resolve(__dirname, '../../pages/widgets/schema-form/form-item-config.js'),
        "@businessComponentConfig": path.resolve(__dirname, '../../pages/dashboard/complex-view/schema-view/components/component-config.js'),
        ...aliasMap,
      }
    })(),
  },
}, businessWebpackConfig);