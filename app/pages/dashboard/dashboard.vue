<template>
  <el-config-provider :locale="zhCn">
    <header-view :proj-name="projName" @menu-select="onMenuSelect">
      <template #main-content>
        <router-view />
      </template>
    </header-view>
  </el-config-provider>
</template>

<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import curl from '@elpisPages/common/curl';
import { useMenuStore } from '@elpisPages/store/menu';
import { useProjectStore } from '@elpisPages/store/project';
import HeaderView from './complex-view/header-view/header-view.vue';

const menuStore = useMenuStore();
const projectStore = useProjectStore();
const route = useRoute();
const router = useRouter();

const projName = ref('');

onMounted(() => {
  getProjectList()
  getProjectConfig()
})

// 请求/api/project/list接口，获取平级项目，存储到 project-store
async function getProjectList(params) {
  const res = await curl({
    url: '/api/project/list',
    method: 'GET',
    query: {
      proj_key: route.query.proj_key
    }
  });
  if (!res || !res.success || !res.data) {
    return;
  }
  projectStore.setProjectList(res.data);
}
// 请求/api/project接口，获取当前项目, 存储到 menu-store
async function getProjectConfig(params) {
  const res = await curl({
    url: '/api/project',
    method: 'GET',
    query: {
      proj_key: route.query.proj_key
    }
  });
  if (!res || !res.success || !res.data) {
    return;
  }
  const { name, menu } = res.data;
  projName.value = name;
  menuStore.setMenuList(menu);
}

// 点击菜单
const onMenuSelect = (menuItem) => {
  const { moduleType, key, customConfig } = menuItem;
  // 当前页面，不处理
  if (key === route.query.key) return;

  const pathMap = {
    sider: '/sider',
    iframe: '/iframe',
    schema: '/schema',
    custom: customConfig?.path,
  }

  router.push({
    path: `/view/dashboard${pathMap[moduleType]}`,
    query: {
      key,
      proj_key: route.query.proj_key
    }
  })
}
</script>

<style scoped lang="less">
:deep(.el-main) {
  padding: 0;
}
</style>
