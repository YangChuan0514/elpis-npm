<template>
  <el-drawer
    v-model="isShow"
    direction="rtl"
    class="edit-form"
    :destroy-on-close="true"
    :size="600"
  >
    <template #header>
      <h3>{{ title }}</h3>
    </template>
    <template #default>
      <schema-form
        ref="editFormRef"
        v-loading="loading"
        :schema="components[name].schema"
        :model="dtoValue"
      />
    </template>
    <template #footer>
      <el-button type="primary" class="" @click="save">
        {{ saveBtnText }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, inject } from 'vue';
import SchemaForm from '@elpisWidgets/schema-form/schema-form.vue';
import curl from '@elpisCommon/curl';
import { ElNotification } from 'element-plus';

const emit = defineEmits(['command']);

const { api, components } = inject('schemaViewData');

const name = ref('editForm');
const editFormRef = ref('editFormRef');
const title = ref('');
const saveBtnText = ref('');
// 主键数据
const mainKey = ref('');
const mainValue = ref();
const dtoValue = ref({});

// loading
const loading = ref(false);
function closeLoading() {
  loading.value = false;
}
function showLoading() {
  loading.value = true;
}

// 展示 控制
const isShow = ref(false);
function show(rowData) {
  const { config } = components?.value[name.value];
  title.value = config.title;
  saveBtnText.value = config.saveBtnText;
  // 初始化值
  mainKey.value = config.mainKey;
  mainValue.value = rowData[config.mainKey];
  dtoValue.value = {};
  
  isShow.value = true;

  loadFormDatta();
}


async function loadFormDatta() {
  if (loading.value) return;
  showLoading();
  const res = await curl({
    url: api.value,
    method: 'get',
    query: {
      [mainKey.value]: mainValue.value
    }
  });
  closeLoading();  
  if (!res || !res.success || !res.data) {
    return;
  }
  // return res.data;
  dtoValue.value = res.data;
}

async function save() {
  if (loading.value) return;
  if (!editFormRef.value.validate()) return;
  showLoading();
  const res = await curl({
    url: api.value,
    method: 'put',
    data: {
      ...editFormRef.value.getValue()
    }
  });
  if (!res || !res.success) {
    return;
  }
  ElNotification({
    title: '保存成功！',
    message: '保存成功！',
    type: 'success'
  });
  closeLoading();
  emit('command', {
    event: 'loadTableData'
  })
}

defineExpose({
  name,
  show,
  close,
})
</script>

<style scoped lang="less">

</style>
