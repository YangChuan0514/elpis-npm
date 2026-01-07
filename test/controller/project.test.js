const assert = require('assert');
const supertest = require('supertest');
const md5 = require('md5');
const elpisCore = require('../../elpis-core');

const signKey = 'asfnaosfja487hasfh3898has9e82hfh3';
const st = Date.now();

describe('测试 project 相关接口', function() {
  this.timeout(60000);

  let request;
  let modelList;
  let projectList = [];

  it('启动服务 ===api_test===', async () => {
    const app = await elpisCore.start();

    modelList = require('../../model/index')(app);
    modelList.forEach((item) => {
      const { project } = item;
      for (const key in project) {
        projectList.push(project[key]);
      }
    })

    request = supertest(app.listen());
  });

  it('GET /api/project without projKey ===api_test===', async () => {
    let temRequest = request.get('/api/project');
    temRequest = temRequest.set('s_t', st);
    temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));

    const res = await temRequest;
    const resBody = res.body;

    assert(resBody.success === false);
    
    assert(resBody.code === 442);
    assert(resBody.message.indexOf("request validate fail: data should have required property 'proj_key'") > -1);
  })

  it('GET /api/project fail ===api_test===', async () => {
    let temRequest = request.get('/api/project');
    temRequest = temRequest.set('s_t', st);
    temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));
    // 传参
    temRequest = temRequest.query({
      proj_key: 'xxxxxxxx',
    })

    const res = await temRequest;
    const resBody = res.body;

    assert(resBody.success === false);
    
    assert(resBody.code === 50000);
    
    assert(resBody.message === '获取项目配置异常！');
  })

  it('GET /api/project with projKey ===api_test===', async () => {
    for (let i = 0; i < projectList.length; i++) {
      const { key: proj_key } = projectList[i];
  
      let temRequest = request.get('/api/project');
      temRequest = temRequest.set('s_t', st);
      temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));

      console.log(`----------- GET /api/project with proj_key: ${proj_key}`);
      // 传参
      temRequest = temRequest.query({
        proj_key,
      })
  
      const res = await temRequest;
  
      assert(res.body.success === true);

      const resData = res.body.data;
      
      assert(resData.key === proj_key);
      assert(resData.modelKey);
      assert(resData.name);
      assert(resData.desc !== undefined);
      assert(resData.homePage !== undefined);

      const { menu } = resData;
      menu.forEach((menuItem) => {
        checkMenu(menuItem);
      })
    }

    // 递归检测 menu 菜单
    function checkMenu(menuItem) {
      console.log(`----------- GET /api/project with proj_key menuKey: ${menuItem.key}`);
      assert(menuItem.key);
      assert(menuItem.name);
      assert(menuItem.menuType);
      
      if (menuItem.menuType === 'group') {
        assert(menuItem.subMenu !== undefined);
        menuItem.subMenu.forEach((subMenuItem) => {
          checkMenu(subMenuItem);
        })
      }
      if (menuItem.menuType === 'module') {
        checkModule(menuItem);
      }
    }
    // 检测 module 菜单配置
    function checkModule(moduleMenu) {
      const { moduleType } = moduleMenu;
      assert(moduleType);
      if (moduleType === 'sider') {
        const { siderConfig } = moduleMenu;
        assert(siderConfig);
        assert(siderConfig.menu);
        siderConfig.menu.forEach((_menu) => {
          checkMenu(_menu);
        })
      }
      if (moduleType === 'iframe') {
        const { iframeConfig } = moduleMenu;
        assert(iframeConfig);
        assert(iframeConfig?.path !== undefined);
      }
      if (moduleType === 'custom') {
        const { customConfig } = moduleMenu;
        assert(customConfig);
        assert(customConfig?.path !== undefined);
      }
      if (moduleType === 'schema') {
        const { schemaConfig } = moduleMenu;
        assert(schemaConfig);
        assert(schemaConfig.api !== undefined);
        assert(schemaConfig.schema);
      }
    }
  })


  it('GET /api/project/model_list ===api_test===', async () => {
    let temRequest = request.get('/api/project/model_list');
    temRequest = temRequest.set('s_t', st);
    temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));

    const res = await temRequest;
    const resData = res.body.data;

    assert(res.body.success === true);

    assert(resData.length > 0);
    
    for (let i = 0; i < resData.length; i++) {
      const item = resData[i];
      assert(item.model)
      assert(item.model.key)
      assert(item.model.name)
      assert(item.project)

      for (const proKey in item.project) {
        const { key, name, desc } = item.project[proKey]
        assert(key)
        assert(name)
        assert(desc)
      }
    }
  });

  it('GET /api/project/list without proj_key ===api_test===', async () => {
    let temRequest = request.get('/api/project/list');
    temRequest = temRequest.set('s_t', st);
    temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));

    const res = await temRequest;
    const resData = res.body.data;

    assert(res.body.success === true);

    assert(resData.length === projectList.length);

    for (let i = 0; i < resData.length; i++) {
      // { name, key, desc, mode, homePage }
      const item = resData[i];
      assert(item.name);
      assert(item.key);
      assert(item.modelKey);
      assert(item.desc !== undefined);
      assert(item.homePage !== undefined);
    }
  });

  it('GET /api/project/list with proj_key ===api_test===', async () => {
    let { key: proj_key } = projectList[Math.floor(Math.random() * projectList.length)];
    const { modelKey } = projectList.find((pro) => pro.key === proj_key);

    let temRequest = request.get('/api/project/list');
    temRequest = temRequest.set('s_t', st);
    temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));

    console.log(`----------- GET /api/project/list with proj_key: ${proj_key}`);
    
    // 传参
    temRequest = temRequest.query({
      proj_key: proj_key,
    })

    const res = await temRequest;
    const resData = res.body.data;

    assert(res.body.success === true);
    assert(projectList.filter(pro => pro.modelKey === modelKey).length === resData.length);

    for (let i = 0; i < resData.length; i++) {
      const item = resData[i];
      assert(item.name);
      assert(item.key);
      assert(item.modelKey);
      assert(item.desc !== undefined);
      assert(item.homePage !== undefined);
    }
  })
})