// import { 
//   ElButton,
//   ElDrawer,
//   ElDropdown,
//   ElDropdownItem,
//   ElDropdownMenu,
//   ElMenu,
//   ElMenuItem,
//   ElMenuItemGroup,
//   ElInput,
//   ElInputNumber,
//   ElRow,
//   ElCol,
//   ElCard,
//   ElConfigProvider,
//   ElIcon,
//   ElSubMenu,
//   ElContainer,
//   ElMain,
//   ElHeader,
//   ElSelect,
//   ElOption,
//   ElForm,
//   ElFormItem,
//   ElDatePicker,
//   ElTable,
//   ElTableColumn,
//   ElPagination,
//   ElAside,
//   ElLoading,
// } from 'element-plus';
// import * as businessElementComponents from '@businessElementComponents'

// export default function registryElementPlus(app) {
//   const uiList = [
//     ElButton,
//     ElDrawer,
//     ElDropdown,
//     ElDropdownItem,
//     ElDropdownMenu,
//     ElMenu,
//     ElMenuItem,
//     ElMenuItemGroup,
//     ElInput,
//     ElInputNumber,
//     ElRow,
//     ElCol,
//     ElCard,
//     ElConfigProvider,
//     ElIcon,
//     ElSubMenu,
//     ElContainer,
//     ElMain,
//     ElHeader,
//     ElSelect,
//     ElOption,
//     ElForm,
//     ElFormItem,
//     ElDatePicker,
//     ElTable,
//     ElTableColumn,
//     ElPagination,
//     ElAside,
//     ElLoading,
//   ];
//   uiList.forEach((comp) => {
//     app.use(comp);
//   });
//   // 用户使用的组件
//   Object.keys(businessElementComponents).forEach((key) => {
//     const component = businessElementComponents[key];
//     if (component && component.install) {
//       app.use(component);
//     }
//   });
// }