<template>
  <el-input v-model="dtoValue" v-bind="schema.option" class="input" />
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
  dtoValue.value = schema?.option?.default;
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
