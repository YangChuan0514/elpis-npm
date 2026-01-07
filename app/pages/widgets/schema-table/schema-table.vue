<template>
  <div class="schema-table">
    <el-table
      v-if="schema && schema.properties"
      v-loading="loading"
      :data="tableData"
      class="table"
    >
      <template v-for="(schemaItem, key) in schema.properties">
        <el-table-column
          v-if="schemaItem.option?.visible !== false"
          :key="key"
          :prop="key"
          :label="schemaItem.label"
          v-bind="schema.option"
        />
      </template>
      <el-table-column
        v-if="buttons?.length > 0"
        fixed="right"
        label="操作"
        :width="operationWidth"
      >
        <template #default="scoped">
          <el-button
            v-for="button in buttons"
            :key="button.label"
            link
            v-bind="button"
            @click="operationHandler({ btnConfig: button, rowData: scoped.row })"
          >
            {{ button.label }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row justify="end" class="pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
      />
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, toRefs } from 'vue';
import curl from '@elpisCommon/curl';

const emit = defineEmits([ 'operate' ]);

const props = defineProps({
  /**
    表格数据 schema - 使用的是 useSchema 构建
    {
      type: 'object',
      properties: {
        key: {
          ...schema, // 标准 schema 配置
          type: 'string', // 字段类型
          label: '', // 字段中文名
          option: {
            ...elTableColumnConfig, // 标准 el-table-column 配置
            visible: true, // 是否在表格中可见，默认true(false、不配置：不展示)
          }
        },
        ...
      }
    }
   */
  schema: {
    type: Object,
    default: () => ({})
  },
  // 表格数据源 API
  api: String,
  /**
    操作按钮
    {
      label: '', // 按钮名称
      eventKey: '', // 事件 key
      eventOption: {}, // 按钮配置项
      ...elButtonConfig, // 标准的el-button 配置项
    }
   */
  // 查询参数
  apiParams: Object,
  buttons: {
    type: Array,
    default: () => []
  }
});
const { api, schema, buttons, apiParams } = toRefs(props);

const loading = ref(false);
const showLoading = () => loading.value = true;
const hideLoading = () => loading.value = false;

const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const operationWidth = computed(() => {
  return buttons.value?.length > 0 ? buttons.value.reduce((preWidth, cur) => {
    return preWidth + cur.label.length * 18
  }, 50) : 50;
});

onMounted(() => {
  initData();
});

watch([ schema, api, apiParams ], () => {
  initData();
});

watch(
  [
    () => currentPage,
    () => pageSize,
  ],
  () => {
    loadTableData()
  }
)

/**
 * 初始化 table 数据
 */
function initData() {
  currentPage.value = 1;
  pageSize.value = 10;
  nextTick(() => {
    loadTableData();
  })
}

let timer = null;
/**
 * 防抖加载数据
 */
function loadTableData() {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    await fetchTableData();
    timer = null;
  }, 100);
}

/**
 * 请求 table 数据
 */
async function fetchTableData() {
  if (!api.value) return;
  showLoading();
  // 处理 当处于最后一页，且场景为：删除最后一条数据时，调整 pageSize
  if (total.value !== 0 && total.value - 1 <= currentPage.value * pageSize.value && currentPage.value > 1) {
    currentPage.value -= 1;
  }
  
  const res = await curl({
    url: `${api.value}/list`,
    method: 'GET',
    query: {
      page: currentPage.value,
      size: pageSize.value,
      ...apiParams.value
    }
  });

  hideLoading();

  if (!res || !res.success || !Array.isArray(res.data)) {
    tableData.value = [];
    total.value = 0;
    return;
  }

  tableData.value = buildTableData(res.data);
  total.value = res.metadata.total;
}
/**
 * 格式化 table 数据，将数据转换为 table 所需的数据格式
 */
function buildTableData(_tableData) {
  if (!schema.value?.properties) {
    return _tableData;
  }
  return _tableData.map((rowData) => {
    for (const dKey in rowData) {
      const schemaItem = schema.value.properties[dKey];
      // 与 schema 进行比对，处理数据格式转换等等
      if (schemaItem?.option?.toFixed > -1 && rowData[dKey].toFixed) {
        rowData[dKey] = rowData[dKey].toFixed(schemaItem.option.toFixed);
      }
    }
    return rowData;
  });
}

/**
 * 操作列 按钮点击事件处理
 */
function operationHandler({ btnConfig, rowData }) {
  emit('operate', { btnConfig, rowData })
}

async function onCurrentChange(value) {
  currentPage.value = value;
  await fetchTableData();
}
async function onSizeChange(value) {
  pageSize.value = value;
  await fetchTableData();
}

defineExpose({
  initData,
  loadTableData,
  showLoading,
  hideLoading,
})

</script>

<style scoped lang="less">
.schema-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;

  .table {
    flex: 1;
  }
  .pagination {
    margin: 10px 0;
    // text-align: right;
  }
}
</style>
