<template>
  <el-date-picker
    v-model="dtoValue"
    v-bind="schema.option"
    type="daterange"
    range-separator="至"
    :start-placeholder="schema.label + '(开始)'"
    :end-placeholder="schema.label + '(结束)'"
    class="data-range"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import moment from 'moment';

const { schema, schemaKey } = defineProps({
  schemaKey: String,
  schema: Object,
});

const emit = defineEmits([ 'loaded' ]);

const dtoValue = ref([]);
function getValue() {
  return dtoValue.value !== undefined ? {
    [`${schemaKey}_start`]: moment(dtoValue.value[0]).format('YYYY-MM-DD'),
    [`${schemaKey}_end`]: moment(dtoValue.value[1]).format('YYYY-MM-DD'),
  } : {}
}
function reset() {
  dtoValue.value = [];
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
