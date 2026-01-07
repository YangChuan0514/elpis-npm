<template>
  <el-row class="schema-view">
    <search-panel
      v-if="searchSchema?.properties && Object.keys(searchSchema.properties).length > 0"
      @search="onSearch"
    />
    <table-panel ref="tablePaneRef" @operate="onTableOperate" />
    <!-- 动态组件 -->
    <component
      :is="componentConfig[key]?.component"
      v-for="(item, key) in components"
      ref="compRefList"
      :key="key"
      @command="onComponentCommand"
    />
  </el-row>
</template>

<script setup>
import { ref, provide } from 'vue';
import SearchPanel from './complex-view/search-panel/search-panel.vue';
import TablePanel from './complex-view/table-panel/table-panel.vue';
import { useSchema } from './hook/schema.js';
import componentConfig from './components/component-config';

const {
  api,
  tableSchema,
  tableConfig,
  searchSchema,
  searchConfig,
  components
} = useSchema();

const apiParams = ref({});
const tablePaneRef = ref(null);
const compRefList = ref([]);

provide('schemaViewData', {
  api,
  apiParams,
  tableSchema,
  tableConfig,
  searchSchema,
  searchConfig,
  components
});

function onSearch(searchValueObj) {
  apiParams.value = searchValueObj;
}

const operateHanlderMap = {
  showComponent: showComponent
}

/**
 * schema-table 事件入口
 * @param btnConfig 按钮配置项 
 * @param rowData table 行数据
 */
function onTableOperate({ btnConfig, rowData }) {
  const { eventKey } = btnConfig;
  if (operateHanlderMap[eventKey]) {
    operateHanlderMap[eventKey]({ btnConfig, rowData });
  };

}

/**
 * 动态组件 事件入口
 */
function onComponentCommand(data) {
  const { event } = data;
  if (event === 'loadTableData') {
    tablePaneRef.value.loadTableData();
  }
}

function showComponent({ btnConfig, rowData }) {
  const { comName } = btnConfig.eventOption;
  // 动态组件名 必传
  if (!comName) return;
  const compRef = compRefList.value.find((comp) => comp.name === comName);
  // 动态组件 必须提供 show 方法
  if (!compRef || typeof compRef.show !== 'function') return;
  compRef.show(rowData);
}

</script>

<style scoped lang="less">
.schema-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
</style>
