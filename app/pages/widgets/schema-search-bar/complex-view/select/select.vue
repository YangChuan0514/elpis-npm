<template>
  <el-select
    v-model="dtoValue"
    v-bind="schema.option"
    class="select"
  >
    <el-option
      v-for="item in schema.option?.enumList"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const { schema, schemaKey } = defineProps({
  schemaKey: String,
  schema: Object,
});

const emit = defineEmits([ 'loaded' ]);

const dtoValue = ref();
function getValue() {
  return dtoValue.value !== undefined ? {
    [schemaKey]: dtoValue.value
  } : {}
}
function reset() {
  dtoValue.value = schema?.option?.default ?? schema.option?.enumList[0]?.value;
}

onMounted(() => {
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
