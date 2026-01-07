# elpis
## elpis是一个企业级全栈应用框架
elpis的设计初衷是为了解决重复性的增删改查工作，将常规的增删改查沉淀到模型中，通过模型解析器解析模型配置，加上模型数据渲染组件将数据渲染到页面，并且支持常规交互。


## model配置

model的配置是使用elpis的重中之重

```javascript
const config = {
  mode: 'dashboard', // 模板类型， 不同类型模板对应不同的模板数据结构
  name: '', // 模板名称
  title: '', // 模板标题
  desc: '', // 模板描述
  icon: '', // 模板图标
  homePage: '', // 模板首页
  // 头部菜单
  menu: [
    {
      key: '', // 菜单唯一描述
      name: '', // 菜单名称
      menuType: '', // 菜单类型(菜单目录、菜单项) group | module

      // 当 menuType === group
      subMenu: [
        {
          // 可递归的菜单项 menuItem
        },
        // ...
      ],

      // 当 menuType === module
      moduleType: '', // 模块类型: sider | iframe | custom | schema

      // 当 moduleType === schema
      schemaConfig: {
        api: '/api/user', // 数据源 restful api
        schema: { // 板块数据配置
          type: 'object',
          properties: {
            key: {
              ...schema, // 标准 schema 配置
              type: 'string', // 字段类型
              label: '', // 字段中文名
              // 字段在 table 中的相关配置
              tableOption: {
                ...elTableColumnConfig, // 标准 el-table-column 配置
                toFixed: 0, // 数字字段，保留几位小数
                visible: true, // 是否在表格中可见，默认true(false：不展示)
              },
              // 字段在 search-bar 对应的配置
              searchOption: {
                ...elComponentConfig, // 标准 elementui 组件配置
                comType: '', // 配置的组件类型
                default: '', // 默认值
              },
              // 字段在动态组件中的配置，前缀对应componentConfig的键值
              // 如：createFormOption = createForm + Option
              createFormOption: {
                ...elComponentConfig,
                comType: '', // 控件类型，如：input、select单独
                visible: true, // 默认true，（true/false）false不展示
                disabled: false, // 是否禁用（true/false）--是否可编辑

                // comType === 'select' 时，启用
                enumList: [], // 枚举值

                // comType === 'dynamicSelect' 时，启用
                api: '', // dynamicSelect 控件数据源
              },
              // 字段在 editForm 中的配置
              editFormOption: {
                ...elComponentConfig,
                comType: '', // 控件类型，如：input、select单独
                visible: true, // 默认true，（true/false）false不展示
                disabled: false, // 是否禁用（true/false）--是否可编辑

                // comType === 'select' 时，启用
                enumList: [], // 枚举值

                // comType === 'dynamicSelect' 时，启用
                api: '', // dynamicSelect 控件数据源
              },
              // 字段在 detailPanel 中的配置
              detailPanelOption: {
                ...elComponentConfig,
              }
            },
            // ...
          },
          // 必填 字段
          required: [],
        },
        // 表格配置
        tableConfig: {
          // 表格头部按钮
          headerButtons: [
            {
              label: '', // 按钮名称
              eventKey: '', // 事件 key
              // 按钮配置项
              eventOption: {
                // 当 eventKey === 'showComponent' 时，启用 comName，决定调用哪个组件
                comName: '', // 组件名
              },
              ...elButtonConfig, // 标准的el-button 配置项
            },
            // ...
          ],
          // 表格行内按钮
          rowButtons: [
            {
              label: '', // 按钮名称
              eventKey: '', // 事件 key
              eventOption: {
                // 当 eventKey === 'showComponent' 时，启用 comName，决定调用哪个组件
                comName: '', // 组件名

                // 当 eventKey === 'remove'（add、remove、update、read）
                params: {
                  // paramKey = 参数的键值
                  // rowValueKey = 参数值（格式：schema::tableKey时，从table中查找传值的值）
                  paramKey: rowValueKey,
                }
              }, // 按钮配置项
              ...elButtonConfig, // 标准的el-button 配置项
            },
            // ...
          ]
        },
        // search-bar 搜索配置
        searchConfig: {},
        // 动态组件配置
        componentConfig: {
          // 新增 form表单 组件配置
          createForm: {
            title: '', // 表单标题
            saveBtnText: '', // 保存按钮文案
          },
          // 编辑 form 表单
          editForm: {
            mainKey: '', // 单条数据唯一标识-主键
            title: '', // 组件标题
            saveBtnText: '', // 保存按钮文案
          },
          // detail-panel 查看单条详情
          detailPanel: {
            mainKey: '', // 单条数据唯一标识-主键
            title: '', // 组件标题
          }
        },
      },

      // 当 moduleType === custom
      customConfig: {
        path: '', // 自定义模块路径
      },

      // 当 moduleType === iframe
      iframeConfig: {
        path: '', // iframe 模块路径
      },

      // 当 moduleType === sider
      siderConfig: {
        menu: [
          {
            // 可递归的菜单项 menuItem （ moduleType !== sider）
          },
          // ...
        ],
      }
    }
  ]
}

module.exports = config;
```

## node服务端启动

引入elpis，并启动。其中，startServer可以传入配置项options，它会挂载在koa-app上，通过```app.options```访问。除此之外，options还会传递给客户端，因此，你可以传递服务端获取到的数据，以实现数据在服务端渲染时服务端和客户端之间的同步。

```javascript
const { startServer } = require('@fivaclo/elpis');
const app = startServer({
    title: 'elpis应用',
    // 其他配置项
});
```

## 自定义服务端
- router-schema

- router
- controller
- service
- extend
- config

1. 在 router-schema 定义接口的入参出参的json-schema，实现接口的入参出参校验能力，这一能力的提供者是elpis的中间件```api-params-verify```。

   ```js
   module.exports = {
     '/api/demo': {
       get: {
         query: {
           type: 'object',
           properties: {
             key: {
               type: 'string',
             }
           }
         }
       }
     }
   }
   ```

   

2. 在router中定义接口路由。

   ```js
   module.exports = (app, router) => {
     const { demo: demoController } = app.controller;
     router.get('/api/demo', demoController.get.bind(demoController));
   }
   ```

   

3. 在controller中定义接口处理器。

   ```js
   module.exports = (app) => {
     return class DemoController {
       get(ctx) {
         this.success(ctx, [{a: 1, b: 'demo'}], {
           total: 3,
         })
       }
     }
   }
   ```

   

4. 在service中定义接口处理服务。

    ```js
    module.exports = (app) => class DemoService {
      // sevice 能力
    }
    ```

5. 在extend中定义其他扩展能力。elpis内置了日志功能，基于log4js。

6. 在根目录的config中定义项目的变量。

   ```js
   // config.dev.js
   module.exports = {
     name: 'demo-default'
   }
   ```

   ```js
   // config.prod.js
   module.exports = {
     name: 'demo-prod'
   }
   ```

   

## 启动/构建前端

在nodejs服务提供页面渲染能力前，我们需要输出页面模板给到nodejs服务。

```javascript
// build.js
const { buildFrontend } = require('@fivaclo/elpis');

// 编译前端工程 - 这里会根据环境变量自动选择启动开发环境还是打包生产环境
buildFrontend(process.env._ENV);
```

## 自定义页面扩展
* 在 `app/pages/` 目录下定义页面入口 entry.xxx.js。

  定义一个demo页面

  ```js
  // app/pages/demo/entry.demo.js
  import elpisBoot from '@elpisBoot';
  import DemoVue from './demo.vue'
  elpisBoot(DemoVue);
  
  // demo.vue
  <template>
    <div style="color: red;">
      demo
      <el-input v-model="value" />
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  const value = ref('');
  
  watch(value, (newvalue, oldvalue) => {
    console.log(oldvalue, newvalue);
  })
  </script>
  
  <style scoped lang="less"></style>
  ```

  

### dashboard / custom-view 自定义页面扩展
1. 在 `app/pages/dashboard/xxx` 书写自定义页面
2. 在 `app/pages/dashboard/router.js` 中定义自定义页面路由

### dashboard / schema-view / components 动态组件扩展
1. 在 `app/pages/dashboard/complex-view/schema-view/components` 下定义自定义动态组件
2. 在 `app/pages/dashboard/complex-view/schema-view/components/component-config.js` 中配置自定义的动态组件

### schema-form 控件扩展
1. 在 `app/pages/widgets/schema-form/complex-view` 中定义自定义表单控件
1. 在 `app/pages/widgets/schema-form/form-item-config.js` 中配置自定义表单控件

### schema-search-bar 控件扩展
1. 在 `app/pages/widgets/schema-search-bar/complex-view` 中定义自定义搜索控件
1. 在 `app/pages/widgets/schema-search-bar/search-item.config.js` 中配置自定义搜索控件

