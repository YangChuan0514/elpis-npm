import Input from "./complex-view/input/input.vue";
import Select from "./complex-view/select/select.vue";
import InputNumber from "./complex-view/input-number/input-number.vue";

// 业务基础组件配置
import businessFormItemConfig from '@businessFormItemConfig';

const formItemConfig = {
  input: {
    component: Input
  },
  inputNumber: {
    component: InputNumber
  },
  select: {
    component: Select
  }
};

export default {
  ...formItemConfig,
  ...businessFormItemConfig, // 可覆盖elpis内置的组件
};