<template>
  <!-- 组件根容器：头部导航主布局，包含折叠按钮、标签文本、用户信息 -->
  <div class="main">
    <!-- 1. 折叠/展开按钮区域：控制侧边栏或内容区域的折叠状态 -->
    <span style="margin-left: 20px;">
      <!-- 可点击操作区：hover 有背景色反馈，点击触发折叠/展开切换 -->
      <span class="operation-span" @click="operation">
        <!-- 折叠图标（基于 showFlag 状态切换）：
               - 未展开（!showFlag）：el-icon-s-fold（折叠图标）
               - 已展开（showFlag）：el-icon-s-unfold（展开图标）
               注：依赖 Element UI 图标库，需确保项目已全局引入 Element UI
           -->
        <i v-if="!showFlag" class="el-icon-s-fold i-folder"></i>
        <i v-else class="el-icon-s-unfold i-folder"></i>
      </span>
    </span>

    <!-- 2. 标签文本区域：显示当前页面/模块标识 -->
    <span>
      <span class="operation-span-tag">
        <!-- 三元表达式：tag 为空时显示"无数据"，否则显示 tag 传递的值（前后各两个空格优化排版） -->
        &nbsp;&nbsp;{{ tag === "" ? "无数据" : tag }}
      </span>
    </span>

    <!-- 3. 用户信息下拉菜单区域：显示头像、用户名，提供个人资料/退出登录功能 -->
    <span class="user-block">
      <!-- Element UI 下拉菜单组件：包裹用户信息触发区和下拉选项 -->
      <el-dropdown class="user-dropdown">
        <!-- 下拉菜单触发区：flex 布局使头像、用户名、下拉箭头垂直居中 -->
        <span
          class="el-dropdown-link"
          style="display: flex; align-items: center;"
        >
          
          <!-- 用户头像：尺寸 35px，图片地址从 props.userInfo.url 获取 -->
          <el-avatar
            :size="35"
            :src="userInfo.url"
            style="margin-top: 0;"
          ></el-avatar>
          <!-- 用户名：左间距 5px，字体大小 16px -->
          <span class="userName" style="margin-left: 5px;font-size: 16px;">{{
            userInfo.name
          }}</span>
          <!-- 下拉箭头图标：左间距 5px，提示可点击展开菜单 -->
          <i
            class="el-icon-arrow-down el-icon--right"
            style="margin-left: 5px;"
          ></i>
        </span>

        <!-- 下拉菜单选项列表（slot="dropdown" 是 Element UI 下拉菜单的固定插槽） -->
        <el-dropdown-menu slot="dropdown">
          <!-- 个人资料选项：图标 + 文字，点击触发 userCenterPanel 方法 -->
          <el-dropdown-item
            icon="el-icon-user-solid"
            @click.native="userCenterPanel"
            >个人资料</el-dropdown-item
          >
          <!-- 退出登录选项：图标 + 文字，点击触发 loginOut 方法 -->
          <el-dropdown-item icon="el-icon-s-fold" @click.native="loginOut"
            >退出登录</el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
    </span>
  </div>
</template>

<script>
// 导出 Vue 2 选项式 API 组件配置
export default {
  name: "LevelHeader", // 组件名称（用于调试、组件注册和开发者工具识别）
  // 组件内部响应式状态：存储组件自身的动态数据
  data() {
    return {
      // 折叠/展开状态标识：从本地存储 sessionStorage 获取初始值（'flag' 对应的值转布尔）
      // 作用：页面刷新后仍保留折叠/展开状态，避免重置
      showFlag: sessionStorage.getItem("flag") === "true"//sessionStorage 是浏览器提供的本地存储 API
    };
  },
  // 组件入参（props）：接收父组件传递的数据，是组件的"输入口"
  props: {
    // 标签文本：字符串类型，必填，默认空字符串（用于显示当前模块名称）
    tag: {
      type: String,
      required: true,//强制要求父组件必须给当前子组件传递这个 props 属性，否则 Vue 会在控制台抛出警告
      default: ""
    },
    // 用户信息：对象类型，必填，默认空对象（包含 url 头像地址、name 用户名等用户信息）
    userInfo: {
      type: Object,
      required: true,
      default: () => ({}) // 对象类型默认值需用函数返回，避免多个组件实例共享同一对象引用
    },
    // 额外参数 bag：字符串类型，非必填，默认空字符串
    bag: {
      type: String,
      default: ""
    }
  },
  // 组件方法：封装组件的业务逻辑，是组件的"功能实现区"
  methods: {
    // 个人资料：触发自定义事件 'eventListener'，传递 'center' 标识给父组件
    // 逻辑：组件不处理具体跳转，仅通知父组件，由父组件统一管理路由或弹窗
    userCenterPanel() {
      this.$emit("eventListener", "center");
    },
    // 退出登录：触发自定义事件 'eventListener'，传递 'loginOut' 标识给父组件
    // 逻辑：组件不处理具体退出逻辑（如清除 Token、跳转登录页），仅通知父组件
    loginOut() {
      this.$emit("eventListener", "loginOut");
    },
    // 折叠/展开切换操作：核心逻辑
    operation() {
      this.showFlag = !this.showFlag; // 切换状态（取反：折叠 → 展开，展开 → 折叠）
      sessionStorage.setItem("flag", this.showFlag); // 将最新状态存入本地存储，持久化保存
      this.$emit("selectOperation", this.showFlag); // 触发自定义事件 'selectOperation'，将最新状态传递给父组件
    }
  }
};
</script>

<!-- 组件局部样式：scoped 确保样式仅作用于当前组件，不污染全局样式；lang="scss" 支持 SCSS 语法 -->
<style scoped lang="scss">
.main {
  padding: 26px 30px 26px 0; // 上下内边距 26px，右内边距 30px，左内边距 0（与折叠按钮左间距配合）
  display: flex; // flex 布局：使子元素（折叠按钮、标签、用户信息）横向排列
  align-items: center; // 子元素垂直居中对齐
  flex-wrap: wrap; // 子元素超出宽度时自动换行（适配小屏幕）
  width: 100%; // 宽度占满父容器
  position: relative; // 相对定位：用于用户信息区域的绝对定位
  background-color: rgb(255, 255, 255); // 背景色：白色
  color: #666; // 默认文字颜色：深灰色

  // 标签文本样式
  .operation-span-tag {
    padding: 9px 10px; // 上下内边距 9px，左右 10px（优化点击区域和视觉效果）
    border-radius: 3px; // 圆角 3px（柔和视觉）
    font-size: 22px; // 字体大小 22px（突出标签）
    font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
      sans-serif; // 自定义字体家族
    user-select: none; // 禁止文本选中复制（优化交互体验）
    margin-top: 15px; // 上外边距 15px（适配换行场景的间距）
  }

  // 折叠/展开按钮 hover 状态样式（反馈点击可能性）
  .operation-span:hover {
    background-color: rgb(248, 248, 248); // 浅灰色背景
  }

  // 折叠/展开按钮基础样式
  .operation-span {
    margin-top: 20px; // 上外边距 20px（与标签文本间距协调）
    padding: 6px; // 内边距 6px（扩大点击区域）
    border-radius: 3px; // 圆角 3px（柔和视觉）
    user-select: none; // 禁止文本选中复制

    // 折叠/展开图标样式
    i {
      margin: 5px; // 外边距 5px（优化图标与边界间距）
      font-size: 20px; // 图标大小 20px
      color: #333; // 图标颜色：深黑色（突出显示）
    }
  }

  // 所有 span 标签基础颜色（覆盖默认的 #666，改为深黑色）
  span {
    color: #333;
  }

  // 用户信息区域样式（绝对定位靠右）
  .user-block {
    position: absolute; // 绝对定位：脱离文档流，靠右排列
    right: 50px; // 右间距 50px（与页面右侧保持距离）

    // 用户名样式
    .userName {
      // display: inline-block; // 行内块级：支持边距和垂直对齐
      vertical-align: middle; // 垂直居中对齐（与头像、箭头协调）
      font-size: 14px; // 字体大小 14px
      cursor: pointer; // 鼠标悬浮为指针（提示可点击展开菜单）
      user-select: none; // 禁止文本选中复制
    }
  }
}
</style>
