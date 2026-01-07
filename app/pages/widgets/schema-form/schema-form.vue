<template>
  <el-row v-if="schema && Object.keys(schema.properties).length > 0" class="schema-form">
    <template v-for="(schemaItem, key) in schema.properties">
      <component
        :is="formItemConfig[schemaItem.option?.comType]?.component"
        v-show="schemaItem.option?.visible !== false"
        ref="formCompRefList"
        :schema-key="key"
        :schema="schemaItem"
        :model="model ? model[key] : undefined"
      />
    </template>
  </el-row>
</template>

<script setup>
import ajv from 'ajv';
import { provide, ref } from 'vue';
import formItemConfig from './form-item-config';

const Ajv = new ajv();
provide('ajv', Ajv);

const formCompRefList = ref([]);

const props = defineProps({
  /**
   schema: { // 板块数据配置
      type: 'object',
      properties: {
        key: {
          ...schema, // 标准 schema 配置
          type: 'string', // 字段类型
          label: '', // 字段中文名
          // 字段在动态组件中的配置，前缀对应componentConfig的键值
          // 如：createFormOption = createForm + Option
          option: {
            ...elComponentConfig,
            comType: '', // 控件类型，如：input、select单独
            visible: true, // 默认true，（true/false）false不展示
            disabled: false, // 是否禁言（true/false）--是否可编辑
            required: true,

            // comType === 'select' 时，启用
            enumList: [], // 枚举值

            // comType === 'dynamicSelect' 时，启用
            api: '', // dynamicSelect 控件数据源
          },
        },
      },
    },
   */
  schema: Object,
  model: Object
});

const { schema } = props;

/**
 * 获取表单值
 */
function getValue() {
  return formCompRefList.value.reduce((prev, cur) => {
    return {
      ...prev,
      ...cur.getValue()
    }
  }, {});
}

/**
 * 表单校验
 */
function validate() {
  return formCompRefList.value.every((com) => com?.validate());
}

defineExpose({
  validate,
  getValue
});
</script>

<style lang="less">
.schema-form {
  .form-item {
    margin-bottom: 20px;
    min-width: 500px;

    .item-label {
      margin-right: 15px;
      min-width: 70px;
      text-align: right;
      font-size: 14px;
      color: #fff;
      word-break: break-all;
    }
    .item-value {
      .component {
        width: 320px;
      }
      .valid-error-border {
        .el-input__wrapper {
          border: 1px solid #F93F3F;
          box-shadow:  0 0 0 0;
        }
        .el-select__wrapper {
          border: 1px solid #F93F3F;
          box-shadow:  0 0 0 0;
        }
      }
    }
    .valid-tips {
      margin-left: 10px;
      height: 36px;
      line-height: 36px;
      overflow: hidden;
      font-size: 12px;
      color: #F93F3F;
    }
  }
}
</style>
