<template>
  <sider-container>
    <template #menu-content>
      <el-menu :default-active="activeKey" :ellpisis="false" @select="onMenuSelect">
        <template v-for="item in menuList">
          <!-- menuType: group -->
          <sub-menu v-if="item.subMenu && item.subMenu.length > 0" :menu-item="item" />
          <!-- menuType: module -->
          <el-menu-item v-else :index="item.key">
            {{ item.name }}
          </el-menu-item>
        </template>
      </el-menu>
    </template>
    <template #main-content>
      222
      <router-view />
    </template>
  </sider-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SiderContainer from '@elpisWidgets/sider-container/sider-container.vue';
import SubMenu from './complex-view/sub-menu/sub-menu.vue';
import { useMenuStore } from '@elpisPages/store/menu';

const router = useRouter();
const route = useRoute();
const menuStore = useMenuStore();

const activeKey = ref('');
const setActive = () => {
  let siderMenuItem = menuStore.findMenu({
    key: 'key',
    value: route.query.sider_key,
  });
  // 首次加载 sider-view，默认选择第一个菜单
  if (!siderMenuItem) {
    let menuItem = menuStore.findMenu({
      key: 'key',
      value: route.query.key,
    });
    if (menuItem && menuItem.siderConfig && menuItem.siderConfig.menu) {
      const siderMenuList = menuItem.siderConfig.menu;
      // 找出第一个sider menu渲染页面
      siderMenuItem = menuStore.findFirstMenu(siderMenuList);
      if (siderMenuItem) {
        // 选中 sider menu 逻辑
        handleMenuSelect(siderMenuItem.key)
      }
    }
  }
  activeKey.value = siderMenuItem?.key;
};

const menuList = ref([]);
const setMenuList = () => {
  const menuItem = menuStore.findMenu({
    key: 'key',
    value: route.query.key,
  });
  if (menuItem && menuItem.siderConfig && menuItem.siderConfig.menu) {
    menuList.value = menuItem.siderConfig.menu;
  }
};

watch(() => route.query.key, () => {
  setActive();
  setMenuList();
});
watch(() => menuStore.menuList, () => {
  setActive();
  setMenuList();
});

onMounted(() => {
  setActive();
  setMenuList();
});

const handleMenuSelect = (menuKey) => {
  const siderMenuItem = menuStore.findMenu({
    key: 'key',
    value: menuKey
  });
  const { moduleType, key, customConfig } = siderMenuItem;
  
  // 当前页面，不跳转
  if (key === route.query.sider_key) return;

  const pathMap = {
    iframe: '/iframe',
    custom: customConfig?.path,
    schema: '/schema'
  }

  router.push({
    path: `/view/dashboard/sider${pathMap[moduleType]}`,
    query: {
      key: route.query.key,
      proj_key: route.query.proj_key,
      sider_key: key,
    }
  })
}
const onMenuSelect = (menuKey) => {
  handleMenuSelect(menuKey);
};


</script>

<style scoped lang="less">

</style>
