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
      <el-input
        v-model="dtoValue"
        v-bind="schema.option"
        :placeholder="placeholder"
        class="component"
        :class="validateTips ? 'valid-error-border' : ''"
        @focus="onFocus"
        @blur="onBlur"
      />
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
  model: String
});

const { schema, schemaKey } = props;
const { model } = toRefs(props);
const name = ref('schema-form:input');
const validateTips = ref('');
const placeholder = ref('');

const dtoValue = ref('');
function initData() {
  dtoValue.value = model.value ?? schema.option?.default;
  // 错误提示置空
  validateTips.value = '';

  // 处理 placeholder
  const { maxLength, minLength, pattern } = schema;
  const ruleList = [];
  if (schema.option?.placeholder) {
    ruleList.push(schema.option.placeholder);
  }
  if (minLength) {
    ruleList.push(`最小长度：${minLength}`)
  }
  if (maxLength) {
    ruleList.push(`最大长度：${maxLength}`);
  }
  if (pattern) {
    ruleList.push(`格式：${pattern}`);
  }
  placeholder.value = ruleList.join('|');
}

onMounted(() => {
  initData()
});

watch([schema, model], () => {
  initData();
}, { deep: true })


function validate() {
  const { type } = schema;

  // 必输 校验
  if (schema.option?.required && !dtoValue.value) {
    validateTips.value  = `${schema.label}不能为空！`;
    return false
  };

  // schema 校验
  if (dtoValue.value) {
    const validate = Ajv.compile(schema);
    const valid = validate(dtoValue.value);
    
    console.log('1111111', valid, validate.errors);
    
    if (!valid && Array.isArray(validate.errors) && validate.errors[0]) {
      const { keyword, params } = validate.errors[0];
      const typeErrorMap = {
        type: `${schema.label}必须为${type}！`,
        minLength: `${schema.label}最小长度为${params.limit}！`,
        maxLength: `${schema.label}最大长度为${params.limit}！`,
        pattern: `${schema.label}格式不正确！`,
      }
      validateTips.value = typeErrorMap[keyword] || '不符合要求！';
      if (validateTips.value === '不符合要求！') {
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
 * 聚焦处理函数
 */
function onFocus() {
  validateTips.value = '';
}
/**
 * 失焦处理函数
 */
function onBlur() {
  validate();
}

defineExpose({
  validate,
  getValue,
});

</script>

<style scoped lang="less">

</style>
