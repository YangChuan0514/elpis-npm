<template>
  <el-drawer
    v-model="isShow"
    direction="rtl"
    :destroy-on-close="true"
    :size="600"
  >
    <template #header>
      <h3>{{ title }}</h3>
    </template>
    <template #default>
      <el-card v-loading="loading" shadow="always" class="detail-panel">
        <el-row
          v-for="(item, key) in components[name]?.schema?.properties"
          :key="key"
          type="flex"
          align="middle"
          class="row-item"
        >
          <el-row class="item-label">
            {{ item.label }}:
          </el-row>
          <el-row class="item-value">
            {{ dtoValue[key] }}
          </el-row>
        </el-row>
      </el-card>
    </template>
  </el-drawer>
</template>

<script setup>
import { inject, ref } from 'vue';
import curl from '@elpisCommon/curl';

const { api, components } = inject('schemaViewData');

const name = ref('detailPanel');
const loading = ref(false);
const title = ref('');
const mainKey = ref();
const mainValue = ref();
const dtoValue = ref({});
// 展示 控制
const isShow = ref(false);
function show(rowData) {
  const { config } = components.value[name.value];
  title.value = config.title;
  mainKey.value = config.mainKey; // 表单主键
  mainValue.value = rowData[mainKey.value]; // 表单主键值
  dtoValue.value = {};

  isShow.value = true;

  fetchFormData();
}
function close() {
  isShow.value = false;
}
async function fetchFormData() {
  if (loading.value) return;
  loading.value = true;
  const res = await curl({
    url: api.value,
    method: 'get',
    query: {
      [mainKey.value]: mainValue.value
    }
  });
  loading.value = false;

  if (!res || !res.success || !res.data) {
    return;
  }

  dtoValue.value = res.data;
}

defineExpose({
  name,
  show,
  close,
})

</script>

<style scoped lang="less">
.detail-panel {
  .row-item {
    border-bottom: 1px solid #ccc;
    .item-label {
      width: 150px;
      margin-right: 20px;
      margin-bottom: 10px;
    }
  }
}
</style>
