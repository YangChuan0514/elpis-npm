import { ref, watch, onMounted, nextTick } from 'vue';
import { useMenuStore } from '@elpisStore/menu';
import { useRoute } from 'vue-router';

export const useSchema = function() {
  const route = useRoute();
  const menuStore = useMenuStore();

  const api = ref('');
  const tableSchema = ref({});
  const tableConfig = ref();
  const searchSchema = ref({});
  const searchConfig = ref();
  const components = ref({});

  // 构造 schema 相关数据配置，给到 schema-view 解析渲染
  function buildData() {
    const { key, sider_key: siderKey } = route.query;
    const menuItem = menuStore.findMenu({
      key: 'key',
      value: siderKey ?? key,
    });
    
    if (menuItem && menuItem.schemaConfig) {
      const { schemaConfig: sConfig } = menuItem;

      const configSchema = _.cloneDeep(sConfig.schema);

      api.value = sConfig.api ?? '';

      tableSchema.value = {};
      tableConfig.value = void 0;
      searchSchema.value = {};
      searchConfig.value = void 0;
      components.value= void 0;

      nextTick(() => {
        // 数据清洗
        // 构造 table-panel 需要的数据: tableConfig + tableSchema
        tableSchema.value = buildDtoSchema(configSchema, 'table');
        tableConfig.value = sConfig.tableConfig;
        // 构造 search-panel 需要的数据: searchConfig + searchSchema
        const dtoSearchSchema = buildDtoSchema(configSchema, 'search');
        // 处理 url 中携带查询参数的情况
        for (const key in dtoSearchSchema) {
          if (route.query[key] !== undefined) {
            dtoSearchSchema.properties[key].option.default = route.query[key];
          }
        }
        searchSchema.value = dtoSearchSchema;
        searchConfig.value = sConfig.searchConfig;
        // 构造动态组件的配置，数据结构：components: {comA: {schema:{}, config:{}}, comB:{...}}
        const { componentConfig } = sConfig;
        if (componentConfig && Object.keys(componentConfig).length > 0) {
          const dtoComponents = {};
          for (const comName in componentConfig) {
            dtoComponents[comName] = {
              schema: buildDtoSchema(configSchema, comName),
              config: componentConfig[comName]
            }
          }
          components.value = dtoComponents;
        }
      });
    }
  }

  // 构建通用的 schema 
  function buildDtoSchema(_schema, schemaType) {
    if (!_schema.properties) return {};

    const dtoSchema = {
      type: 'object',
      properties: {}
    };
    // 构建数据
    for (const propKey in _schema.properties) {
      const props = _schema.properties[propKey];
      // tableOption formOption searchBarOption 等等
      if (props[`${schemaType}Option`]) {
        let dtoProps = {};
        for (const _pKey in props) {
          // 非 Option 的数据
          if (_pKey.indexOf('Option') < 0) {
            dtoProps[_pKey] = props[_pKey];
          }
        }
        // 处理 tableOption formOption searchBarOption 等等
        dtoProps = Object.assign({}, dtoProps, { option: props[`${schemaType}Option`]});

        // 处理 required: 必填字段
        const { required } = _schema;
        if (required && Array.isArray(required) && required.find((rk) => rk === propKey)) {
          dtoProps.option.required = true;
        }

        dtoSchema.properties[propKey] = dtoProps;
      }
    }
    
    return dtoSchema;
  }

  watch(
    [
      () => route.query.key,
      () => route.query.sider_key,
      () => menuStore.menuList,
    ],
    () => {
      buildData();
    },
    { deep: true }
  );

  onMounted(() => {
    buildData();
  });

  return {
    api,
    tableSchema,
    tableConfig,
    searchSchema,
    searchConfig,
    components
  }
}