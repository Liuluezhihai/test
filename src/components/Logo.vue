<template>
  <!-- Logo组件根容器，使用span包裹图标和文字 -->
  <span class="logo">
    <!-- Element UI图片组件：用于显示Logo图标 -->
    <!-- style="width: 30px; height: 30px": 固定Logo图片尺寸为30x30px -->
    <!-- src="/logo.png": Logo图片路径（根目录下的logo.png文件） -->
    <!-- fit="fill": 图片填充方式，拉伸填充整个容器（不保持比例） -->
    <el-image
      style="width: 30px; height: 30px"
      src="/logo.png"
      fit="fill"
    ></el-image>

    <!-- 系统名称显示容器 -->
    <!-- v-if="!flag": 当flag为false时显示系统名称，flag为true时隐藏 -->
    <div v-if="!flag">
      <!-- 系统名称文本 -->
      <!-- :style: 动态绑定样式 -->
      <!-- color: bag: 文字颜色绑定父组件传入的bag属性 -->
      <!-- display: 'block': 块级显示，使文字独占一行 -->
      <span :style="{ color: bag, display: 'block' }">{{ name }}</span>
    </div>
  </span>
</template>

<script>
// 导出Logo组件
export default {
  // 组件名称
  name: "Logo",
  // 组件数据（本组件无内部状态，返回空对象）
  data() {
    return {};
  },
  // 组件接收的props参数（父组件传递的属性）
  props: {
    // 系统名称
    name: {
      type: String, // 数据类型为字符串
      default: "系统" // 默认值为"系统"，父组件未传递时使用
    },
    // 名称显示控制标识
    flag: {
      type: Boolean, // 数据类型为布尔值
      required: false // 非必传参数，父组件可选择是否传递
    },
    // 名称文字颜色
    bag: {
      type: String, // 数据类型为字符串（支持颜色值，如"#1c1c1c"、"red"）
      default: "#1c1c1c" // 默认颜色为深黑色（#1c1c1c）
    }
  },
  // 组件创建生命周期钩子（本组件无初始化逻辑，留空）
  created() {},
  // 组件方法（本组件无自定义方法，留空）
  methods: {}
};
</script>

<style scoped lang="scss">
// Logo组件根容器样式
.logo {
  color: rgb(
    8,
    24,
    16
  ) !important; // 文字颜色（深墨绿色），!important提升优先级
  font-weight: bold; // 字体粗细：加粗
  font-size: 20px; // 字体大小20px
  display: flex; // 弹性布局，使图标和文字横向排列
  align-items: center; // 垂直居中对齐
  flex-wrap: wrap; // 当空间不足时自动换行（适配小屏幕）
  user-select: none; // 禁止文本选中（避免用户误选Logo文字）

  // 系统名称文本样式（嵌套选择器，作用于内部span标签）
  span {
    margin-left: 8px; // 与Logo图标保持8px间距
    color: #666; // 文字颜色（灰色），覆盖父容器的颜色设置
    // 字体族：优先使用Impact等粗体字体，无则降级为系统默认无衬线字体
    font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
  }
}
</style>
