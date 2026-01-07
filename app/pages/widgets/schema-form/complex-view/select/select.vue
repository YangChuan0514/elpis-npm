<template>
  <el-row align="middle" class="form-item">
    <!-- label -->
    <el-row class="item-label" justify="end">
      <el-row v-if="schema.option?.required">
        *
      </el-row>
      {{ schema.label }}
    </el-row>
    <!-- value -->
    <el-row class="item-value">
      <el-select
        v-model="dtoValue"
        v-bind="schema.option"
        class="component"
        :class="validateTips ? 'valid-error-border' : ''"
        @change="onChange"
      >
        <el-option
          v-for="option in schema.option?.enumList"
          :key="option.value"
          :label="option.labele"
          :value="option.value"
        />
      </el-select>
    </el-row>
    <!-- 错误提示 -->
    <el-row v-if="validateTips" class="valid-tips">
      {{ validateTips }}
    </el-row>
  </el-row>
</template>

<script setup>
import { ref, watch, toRefs, onMounted, inject } from 'vue';

const Ajv = inject('ajv');

const props = defineProps({
  schemaKey: String,
  schema: Object,
  model: [Number, String]
});

const { schema, schemaKey } = props;
const { model } = toRefs(props);
const name = ref('schema-form:select');
const validateTips = ref('');

const dtoValue = ref('');
function initData() {
  dtoValue.value = model.value ?? schema.option?.default;
  // 错误提示置空
  validateTips.value = '';
}

onMounted(() => {
  initData()
});

watch([schema, model], () => {
  initData();
}, { deep: true })


function validate() {
  // 必输 校验
  if (schema.option?.required && !dtoValue.value) {
    validateTips.value  = `${schema.label}不能为空！`;
    return false
  };

  // schema 校验
  if (dtoValue.value) {
    let dtoNum = [];
    if (schema.option?.enumList) {
      dtoNum = schema.option.enumList.map((item) => item.value);
    }
    const validate = Ajv.compile({
      schema,
      ...{ enum: dtoNum }
    });
    const valid = validate(dtoValue.value);
    if (!valid && validate.errors && validate.errors[0]) {
      if (validate.errors[0].type === 'enum') {
        validateTips.value = `取值不符合枚举范围！`;
      } else {
        validateTips.value = `不符合要求！`;
        console.error(`${name.value} 组件校验错误：`, validate.errors[0]);
      }
      return false;
    }
  }
  return true;
}

function getValue() {
  return dtoValue.value !== '' ? {
    [schemaKey]: dtoValue.value
  } : {};
}
/**
 * change 事件处理函数
 */
function onChange() {
  validate();
}


defineExpose({
  validate,
  getValue,
});

</script>

<style scoped lang="less">

</style>
