<template>
  <el-select
    v-model="dtoValue"
    v-bind="schema.option"
    class="dynamic-select"
  >
    <el-option
      v-for="item in enumList"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import curl from '@elpisCommon/curl';

const { schema, schemaKey } = defineProps({
  schemaKey: String,
  schema: Object,
});

const emit = defineEmits([ 'loaded' ]);

const enumList = ref([]);
async function fetchEnumList() {
  const res = await curl({
    url: schema.option?.api,
    method: 'get',
    data: {}
  });
  if (res?.data?.length > 0) {
    enumList.value.push(...res.data);
  }
}

const dtoValue = ref();
function getValue() {
  return dtoValue.value !== undefined ? {
    [schemaKey]: dtoValue.value
  } : {}
}
function reset() {
  dtoValue.value = schema?.option?.default ?? enumList.value[0]?.value;
}

onMounted(async () => {
  await fetchEnumList();
  reset();
  emit('loaded');
});

defineExpose({
  reset,
  getValue,
});

</script>

<style scoped lang="less">

</style>
