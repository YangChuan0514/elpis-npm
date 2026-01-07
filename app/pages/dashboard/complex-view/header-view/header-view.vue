<template>
  <header-container :title="projName">
    <template #menu-content>
      <!-- 根据 menu store 渲染当前项目的菜单 -->
      <el-menu
        :default-active="activeKey"
        :ellipsis="false"
        mode="horizontal"
        @select="onMenuSelect"
      >
        <template v-for="item in menuStore.menuList">
          <sub-menu
            v-if="item.subMenu && item.subMenu.length > 0"
            :menu-item="item"
          />
          <el-menu-item
            v-else
            :index="item.key"
          >
            {{ item.name }}
          </el-menu-item>
        </template>
      </el-menu>
    </template>
    <template #setting-content>
      <!-- 根据 project stroe 渲染同级项目 -->
      <el-dropdown @command="handleCommand">
        <span class="project-list">
          {{ projName }}
          <el-icon
            v-if="projectStore.projectList.length > 1"
            class="el-icon--right"
          >
            <ArrowDown />
          </el-icon>
        </span>
        <template
          v-if="projectStore.projectList.length > 1"
          #dropdown
        >
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="proItem in projectStore.projectList"
              :key="proItem.key"
              :command="proItem.key"
              :disabled="proItem.name === projName"
            >
              {{ proItem.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
        <el-dropdown-menu />
      </el-dropdown>
    </template>
    <template #main-content>
      <!-- 主内容 -->
      <slot name="main-content" />
    </template>
  </header-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import HeaderContainer from '@elpisPages/widgets/header-container/header-container.vue';
import SubMenu from './complex-view/sub-menu/sub-menu.vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { useMenuStore } from '@elpisPages/store/menu';
import { useProjectStore } from '@elpisPages/store/project';

const route = useRoute();

const menuStore = useMenuStore();
const projectStore = useProjectStore();

defineProps({
  projName: {
    type: String,
    default: ''
  }
});
const emit = defineEmits([ 'menu-select' ]);

const activeKey = ref('');
const setActive = () => {
  const menuItem = menuStore.findMenu({
    key: 'key',
    value: route.query.key,
  });
  activeKey.value = menuItem?.key; 
}
watch(
  [
    () => route.query.key,
    () => menuStore.menuList
  ], 
  () => {
    setActive();
  },
  { deep: true }
);

onMounted(() => {
  setActive();
})

function onMenuSelect(menuKey) {
  const menuItem = menuStore.findMenu({
    key: 'key',
    value: menuKey
  });
  emit('menu-select', menuItem);
}

function handleCommand(ev) {
  const projItem = projectStore.projectList.find(pro => pro.key === ev);
  if (!projItem || !projItem.homePage) return;
  const { origin, pathname } = window.location;
  window.location.replace(`${origin}${pathname.split('/').slice(0, -1).join('/')}${projItem.homePage}`);
}
</script>

<style scoped lang="less">
:deep(.el-menu--horizontal.el-menu) {
  border-bottom: 0;
}
.project-list {
  margin-right: 20px;
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  outline: none;
}
</style>
