<template>
  <iframe :src="path" class="iframe" />
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMenuStore } from '@elpisStore/menu';

const route = useRoute();
const menuStore = useMenuStore();

const path = ref('');
const setPath = () => {
  const { key, sider_key: siderKey } = route.query;
  const iframeMenuItem = menuStore.findMenu({
    key: 'key',
    value: siderKey ?? key,
  });
  path.value = iframeMenuItem?.iframeConfig?.path ?? '';
}

watch(
  [
    () => route.query.key,
    () => route.query.sider_key,
    () => menuStore.menuList,
  ],
  () => {
    setPath();
  },
  { deep: true }
);

onMounted(() => {
  setPath();
})
</script>

<style scoped lang="less">
.iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
