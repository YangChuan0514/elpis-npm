<template>
  <el-card class="table-panel">
    <!-- 操作按钮 区域 -->
    <el-row
      v-if="tableConfig?.headerButtons?.length > 0"
      justify="end"
      class="operation-panel"
    >
      <el-button
        v-for="item in tableConfig.headerButtons"
        v-bind="item"
        @click="handleOperation({ btnConfig: item })"
      >
        {{ item.label }}
      </el-button>
    </el-row>
    <!-- 表格 区域 -->
    <schema-table
      ref="schemaTableRef"
      :schema="tableSchema"
      :api="api"
      :api-params="apiParams"
      :buttons="tableConfig?.rowButtons ?? []"
      @operate="handleOperation"
    />
  </el-card>
</template>

<script setup>
import { ref, inject } from 'vue';
import { ElMessageBox, ElNotification } from 'element-plus';
import SchemaTable from '@elpisWidgets/schema-table/schema-table.vue';
import curl from '@elpisCommon/curl';

const {
  api,
  apiParams,
  tableSchema,
  tableConfig,
} = inject('schemaViewData');

const emit = defineEmits([ 'operate' ]);

const schemaTableRef = ref(null);

/**
 * 加载 table 数据
 */
async function loadTableData() {
  await schemaTableRef.value.loadTableData();
}
/**
 * 初始化加载 table 数据
 */
async function initData() {
  await schemaTableRef.value.initData();
}

function removeData({ btnConfig, rowData }) {
  const { eventOption } = btnConfig;
  // 删除数据，必须配置 params 给到传值规则（键、值）
  if (!eventOption?.params) return;

  const { params } = eventOption;

  let removeValue;
  const removeKey = Object.keys(params)[0];
  const removeValueList = params[removeKey].split('::');
  if (removeValueList[0] === 'schema' && removeValueList[1]) {
    removeValue = rowData[removeValueList[1]]
  }

  ElMessageBox.confirm(
    `确认删除 ${removeKey} 为：${removeValue} 数据？`,
    'Warning',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    schemaTableRef.value.showLoading();
    const res = await curl({
      url: `${api.value}`,
      method: 'delete',
      data: {
        [removeKey]: removeValue,
      },
      errorMessage: '删除失败！'
    });
    schemaTableRef.value.hideLoading();

    if (!res | !res.success || !res.data) {
      return;
    }

    ElNotification({
      message: '删除成功！',
      type: 'success'
    });
    
    // await initData();
    await loadTableData();
  })

}
const eventHandlerMap = {
  'remove': removeData,
}
function handleOperation({ btnConfig, rowData }) {
  const { eventKey } = btnConfig;
  
  if (eventHandlerMap[eventKey]) {
    // 当前组件有处理函数 => 执行
    eventHandlerMap[eventKey]({ btnConfig, rowData });
  } else {
    // 没有 => 向上传递
    emit('operate', { btnConfig, rowData });
  }
}


defineExpose({
  initData,
  loadTableData,
})

</script>

<style scoped lang="less">
.table-panel {
  flex: 1;
  margin: 10px;

  .operation-panel {
    margin-bottom: 10px;
  }
}

:deep(.el-card__body) {
  height: 98%;
  display: flex;
  flex-direction: column;
}
</style>
