import Input from './complex-view/input/input.vue';
import Select from './complex-view/select/select.vue';
import DateRange from './complex-view/date-range/date-range.vue';
import DynamicSelect from './complex-view/dynamic-select/dynamic-select.vue';

import businessSearchItemConfig from '@businessSearchItemConfig'

const SearchItemConfig = {
  input: {
    component: Input,
  },
  select: {
    component: Select,
  },
  dateRange: {
    component: DateRange,
  },
  dynamicSelect: {
    component: DynamicSelect,
  },
}

export default {
  ...SearchItemConfig,
  ...businessSearchItemConfig
};