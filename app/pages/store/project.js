import { ref } from "vue";
import { defineStore } from "pinia";

export const useProjectStore = defineStore('project', () => {
  // 项目列表
  const projectList = ref([]);

  // 设置项目列表
  const setProjectList = (list) => {
    projectList.value = list;
  }

  return {
    projectList,
    setProjectList,
  }
});