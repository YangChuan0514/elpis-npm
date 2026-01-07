<template>
  <el-card class="search-panel">
    <schema-search-bar
      :schema="searchSchema"
      @loaded="onLoaded"
      @search="onSearch"
      @reset="onReset"
    />
  </el-card>
</template>

<script setup>
import { inject } from 'vue';
import SchemaSearchBar from '@elpisWidgets/schema-search-bar/schema-search-bar.vue';

const { searchSchema } = inject('schemaViewData');

const emit = defineEmits([ 'search' ]);

function onLoaded(searchValueObj) {
  emit('search', searchValueObj)
}

function onSearch(searchValueObj) {
  emit('search', searchValueObj)
}

function onReset() {
  emit('search', {})
}

</script>

<style scoped lang="less">
.search-panel {
  margin: 10px 10px 0 10px;
}
:deep(.el-card__body) {
  padding-bottom: 2px;
}
</style>
