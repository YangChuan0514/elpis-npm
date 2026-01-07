<template>
  <el-form
    v-if="schema && schema.properties"
    :inline="true"
    class="schema-search-bar"
  >
    <!-- 动态表单组件 -->
    <el-form-item
      v-for="(schemaItem, key) in schema.properties"
      :key="key"
      :label="schemaItem.label"
    >
      <!-- 具体的动态组件的组件 -->
      <component
        :is="SearchItemConfig[schemaItem.option?.comType]?.component"
        ref="searchComLsit"
        :schema-key="key"
        :schema="schemaItem"
        @loaded="handleChildLoaded"
      />
    </el-form-item>
    <!-- 操作区域 -->
    <el-form-item>
      <el-button
        type="primary"
        plain
        class="search-btn"
        @click="search"
      >
        搜索
      </el-button>
      <el-button plain class="reset-btn" @click="reset">
        重置
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, toRefs } from 'vue';
import SearchItemConfig from './search-item.config';

const emit = defineEmits([ 'loaded', 'search', 'reset' ]);

const props = defineProps({
  /**
   * schema 的数据结构：
    {
      type: 'object',
      properties: {
        key: {
          ...schema, // 标准 schema 配置
          type: 'string', // 字段类型
          label: '', // 字段中文名
          option: {
            ...elComponentConfig, // 标准 elementui 组件配置
            comType: '', // 配置的组件类型
            default: '', // 默认值
          }
        },
        ...
      }
    },
   */
  schema: Object
});

const { schema } = toRefs(props);

// 收集所有的子组件实例，方便调用它们的方法
const searchComLsit = ref([]);

/**
 * 将所有的子组件的数据包装起来，给到外界
 */
function getValue() {
  return searchComLsit.value.reduce((pre, cur) => {
    return {
      ...pre,
      ...cur?.getValue()
    }
  }, {});
}

let childComLoadedCount = 0;
/**
 * 子组件全部加载完成，抛出加载完成的事件
 */
function handleChildLoaded() {
  childComLoadedCount++;
  if (childComLoadedCount >= Object.keys(schema?.value?.properties).length) {
    emit('loaded', getValue());
  }
}

function search() {
  emit('search', getValue());
}

function reset() {
  searchComLsit.value.forEach((comp) => {
    comp?.reset();
  });
  emit('reset');
}

defineExpose({
  search,
  reset,
  getValue
})

</script>

<style lang="less">
.schema-search-bar {
  min-width: 500px;
  .input {
    width: 280px;
  }
  .select {
    width: 280px;
  }
  .dynamic-select {
    width: 280px;
  }
  .search-btn {
    width: 100px;
  }
  .reset-btn {
    width: 100px;
  }
}
</style>
