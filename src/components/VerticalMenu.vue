<!-- eslint-disable vue/no-use-v-if-with-v-for -->
<template>
  <!-- Element UI菜单组件：管理员侧边菜单 -->
  <!-- :collapse-transition="false": 关闭折叠/展开的过渡动画 -->
  <!-- :collapse="flag": 控制菜单是否折叠，绑定父组件传入的flag属性 -->
  <!-- style: 内边距5px 20px + 最大宽度253px（限制菜单宽度） -->
  <!-- :default-active="activeIndex": 当前激活菜单的索引，绑定组件内的activeIndex -->
  <!-- :background-color="bag": 菜单背景色，绑定父组件传入的bag属性 -->
  <!-- text-color="#666": 菜单默认文字颜色（深灰色） -->
  <!-- @select="handleSelect": 菜单选中事件，触发handleSelect方法 -->
  <el-menu
    :collapse-transition="false"
    :collapse="flag"
    style="padding: 5px 20px;max-width: 253px;"
    :default-active="activeIndex"
    :background-color="bag"
    text-color="#666"
    @select="handleSelect"
  >
    <!-- 动态渲染菜单列表 -->
    <!-- v-for="(item, index) in routes": 遍历父组件传入的路由菜单数据 -->
    <!-- :key="index": 列表渲染唯一标识（使用索引） -->
    <!-- style="width: 100%;": 菜单项宽度100%（占满父容器） -->
    <!-- v-if="!item.isHidden": 只渲染未隐藏的菜单（isHidden为false） -->
    <!-- :index="item.path": 菜单项索引，绑定菜单数据中的路由路径 -->
    <!-- :class="{ 'is-active': activeIndex === item.path }": 动态添加激活样式，当前选中菜单匹配时生效 -->
    <el-menu-item
      v-for="(item, index) in routes"
      :key="index"
      style="width: 100%;"
      v-if="!item.isHidden"
      :index="item.path"
      :class="{ 'is-active': activeIndex === item.path }"
    >
      <!-- 菜单图标：绑定菜单数据中的icon类名，字体大小20px -->
      <i :class="item.icon" style="font-size: 20px;"></i>
      <!-- 菜单标题：使用slot="title"指定为Element UI菜单的标题区域，字体大小14px -->
      <span slot="title" style="font-size: 14px;">{{ item.name }}</span>
    </el-menu-item>
  </el-menu>
</template>

<script>
// 管理员侧边菜单组件：接收路由菜单数据，支持折叠/展开，记录选中状态
export default {
  // 组件名称
  name: "AdminMenu",

  // 组件数据
  data() {
    return {
      activeIndex: "1", // 当前激活菜单的索引，默认值为"1"
      isCollapse: true, // 菜单折叠状态
      selectedMenuItem: "" // 选中的菜单项
    };
  },

  // 组件接收的props参数（父组件传递的数据）
  props: {
    // 路由菜单数据数组：存储所有待渲染的菜单信息
    routes: {
      type: Array, // 数据类型为数组
      required: true // 必传参数（父组件必须提供）
    },
    // 菜单折叠控制标识：控制菜单是否折叠
    flag: {
      type: Boolean, // 数据类型为布尔值
      required: true // 必传参数（父组件必须提供）
    },
    // 菜单背景色：自定义菜单背景
    bag: {
      type: String, // 数据类型为字符串（支持颜色值）
      default: "#FFFFFF" // 默认背景色为白色
    }
  },

  // 组件创建生命周期钩子：组件实例创建完成后执行
  created() {
    // 从sessionStorage获取上次选中的菜单路径（持久化选中状态）
    const saveLastPath = sessionStorage.getItem("activeMenuItem");
    if (saveLastPath === null) {
      // 若未存储过选中路径，默认加载首页路由（/adminLayout）
      this.handleSelect("/adminLayout");
    } else {
      // 若存储过选中路径，加载上次选中的路由
      this.handleSelect(saveLastPath);
    }
  },

  // 组件方法
  methods: {
    /**
     * 菜单选中事件处理：更新激活索引、通知父组件、持久化选中状态
     * @param {string} index - 选中菜单的索引（即菜单对应的路由路径）
     */
    handleSelect(index) {
      this.activeIndex = index; // 更新当前激活菜单的索引
      this.$emit("select", this.activeIndex); // 向父组件触发事件，传递选中的路由路径
      sessionStorage.setItem("activeMenuItem", this.activeIndex); // 存储选中路径到sessionStorage（页面刷新后保留）
    }
  }
};
</script>

<style scoped>
/* 菜单激活状态样式：选中时的背景色、文字色、字体粗细、圆角 */
.is-active {
  background-color: rgb(235, 237, 245) !important;
  /* 激活背景色：浅蓝灰色（!important提升优先级） */
  color: #1c1c1c !important;
  /* 激活文字色：深黑色（!important提升优先级） */
  font-weight: bold;
  /* 字体粗细：加粗 */
  border-radius: 6px;
  /* 圆角6px */
}

/* 菜单项和子菜单标题基础样式 */
.el-menu-item,
.el-submenu__title {
  height: 45px !important;
  /* 固定高度45px（!important覆盖Element UI默认样式） */
  line-height: 45px !important;
  /* 行高与高度一致，实现垂直居中（!important覆盖默认） */
  user-select: none;
  /* 禁止文本选中（避免点击时选中菜单文字） */
  color: #333;
  /* 默认文字色：深灰色 */
}

/* 菜单项聚焦和hover状态样式 */
.el-menu-item:focus,
.el-menu-item:hover {
  box-sizing: border-box;
  /* 盒模型：border和padding计入宽高 */
  border-radius: 5px;
  /* 圆角5px */
  background-color: rgb(235, 237, 245) !important;
  /* 背景色：浅蓝灰色（!important覆盖默认） */
}

/* 菜单项补充样式（与上方重复，可合并优化） */
.el-menu-item {
  height: 45px !important;
  /* 固定高度45px */
  line-height: 45px !important;
  /* 垂直居中 */
  margin: 3px;
  /* 菜单项间距3px */
}
</style>
