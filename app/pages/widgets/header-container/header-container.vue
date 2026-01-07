<template>
  <el-container class="header-container">
    <el-header class="header">
      <!-- 左侧logo、标题区域 -->
      <el-row align="middle" class="header-row">
        <el-row align="middle" class="title-panel">
          <img src="/static/logo.png" class="logo">
          <el-row class="text">
            {{ title }}
          </el-row>
        </el-row>
        <!-- 中部菜单区域：插槽 TODO: 后续菜单都改到左侧 -->
        <slot name="menu-content" />
        <!-- 右侧用户、操作预期 -->
        <el-row align="middle" justify="end" class="setting-panel">
          <!-- 设置区域 -->
          <slot name="setting-content" />
          <!-- user panel -->
          <component :is="headerContainerConfig.userPanel?.component" v-if="headerContainerConfig?.userPanel" />
        </el-row>
      </el-row>
    </el-header>
    <el-main class="main-container">
      <!-- 核心内容填充区域 -->
      <slot name="main-content" />
    </el-main>
  </el-container>
</template>

<script setup>
import headerContainerConfig from '@headerContainerConfig';

defineProps({
  title: {
    type: String,
    default: ''
  }
});
</script>

<style lang="less" scoped>
.header-container {
  height: 100%;
  min-width: 1000px;
  overflow: hidden;
  .header {
    max-height: 120px;
    border-bottom: 1px solid #e8e8e8;
    .header-row {
      height: 60px;
      padding: 0 20px;
      .title-panel {
        width: 180px;
        max-width: 180px;
        .logo {
          margin-right: 10px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
        }
        .text {
          font-size: 15px;
        }
      }
      .setting-panel {
        margin-left: auto;
        min-width: 180px;
      }
    }
  }
  .main-container { }
}

:deep(.el-header) {
  padding: 0;
}
</style>