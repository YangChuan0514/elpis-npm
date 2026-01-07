import { ref } from "vue";
import { defineStore } from "pinia";

export const useMenuStore = defineStore('menu', () => {
  // 菜单列表
  const menuList = ref([]);

  // 设置菜单列表
  const setMenuList = (list) => {
    menuList.value = list;
  }

  /**
   * 查找菜单
   * @param key 查询的字段
   * @param value 查询的值
   * @param mList 需要搜索的菜单列表
   */
  const findMenu = ({key, value}, mList = menuList.value) => {
    for (let i = 0; i < mList.length; i++) {
      const menuItem = mList[i];
      // 特殊情况： 为空
      if (!menuItem) continue;
      // 找到了，直接返回
      if (menuItem[key] === value) return menuItem;

      const { menuType, moduleType, siderConfig } = menuItem;
      // 当是 菜单嵌套时
      if (menuType === 'group' && menuItem.subMenu) {
        const item = findMenu({ key, value}, menuItem.subMenu);
        if (item) return item;
      }
      // 当是 侧边菜单时
      if (moduleType === 'sider' && siderConfig && siderConfig.menu) {
        const item = findMenu({ key, value}, siderConfig.menu);
        if (item) return item;
      }
    }
  }

  /**
   * 获取第一个 sider menu
   * @param mList sider menu 数组
   */
  const findFirstMenu = (mList = menuList.value) => {
    if (!mList || !mList[0]) return;
    let firstMenu = mList[0];
    if (firstMenu.subMenu) {
      firstMenu =  findFirstMenu(firstMenu.subMenu);
    }
    return firstMenu;
  }

  return {
    menuList,
    setMenuList,
    findMenu,
    findFirstMenu
  }
});