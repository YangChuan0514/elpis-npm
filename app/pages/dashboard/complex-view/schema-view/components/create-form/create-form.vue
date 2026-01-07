<template>
  <el-drawer
    v-model="isShow"
    direction="rtl"
    :destroy-on-close="true"
    :size="600"
  >
    <template #header>
      <h3>
        {{ title }}
      </h3>
    </template>
    <template #default>
      <schema-form ref="schemaFormRef" :schema="components[name]?.schema" />
    </template>
    <template #footer>
      <el-button class="" type="primary" @click="save">
        {{ saveBtnText }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { inject, ref } from 'vue';
import { ElNotification } from 'element-plus';
import SchemaForm from '@elpisPages/widgets/schema-form/schema-form.vue';
import curl from '@elpisCommon/curl';

const emit = defineEmits([ 'command' ])

const { api, components } = inject('schemaViewData');

const schemaFormRef = ref(null);

const name = ref('createForm');
const loading = ref(false);
const title = ref('');
const saveBtnText = ref('');

const isShow = ref(false);
function show() {
  const { config } = components.value[name.value];

  title.value = config.title;
  saveBtnText.value = config.saveBtnText;

  isShow.value = true;
}

async function save() {
  // 防止重复提交
  if (loading.value) return;
  if (!schemaFormRef.value.validate()) return;
  loading.value = true;
  const res = await curl({
    url: api.value,
    method: 'post',
    data: {
      ...schemaFormRef.value.getValue()
    }
  });
  if (!res || !res.success) {
    return;
  }
  ElNotification({
    title: '创建成功',
    message: '创建成功！',
    type: 'success'
  });
  loading.value = false;
  close();
}

function close() {
  isShow.value = false;
  emit('command', {
    event: 'loadTableData'
  })
}

defineExpose({
  name,
  show,
});

</script>

<style scoped lang="less">

</style>
