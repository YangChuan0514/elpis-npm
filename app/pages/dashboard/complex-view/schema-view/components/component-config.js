import CreateForm from "./create-form/create-form.vue";
import EditForm from "./edit-form/edit-form.vue";
import DetailPanel from "./detail-panel/detail-panel.vue";

// 业务动态组件拓展配置
import businessComponentConfig from '@businessComponentConfig';

const componentConfig = {
  createForm: {
    component: CreateForm
  },
  editForm: {
    component: EditForm
  },
  detailPanel: {
    component: DetailPanel
  }
};

export default {
  ...componentConfig,
  ...businessComponentConfig, // 可覆盖elpis内置的组件
};