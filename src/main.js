// 导入Vue核心库（Vue 2.x 核心框架）
import Vue from "vue";
// 导入根组件App（项目入口组件，包含所有页面的布局容器）
import App from "./App.vue";
// 导入路由实例（已配置好的路由规则和路由守卫，用于页面跳转）
import router from "./router";
// 导入Element UI组件库的样式文件（确保Element组件样式正常显示）
import "element-ui/lib/theme-chalk/index.css";
// 导入Element UI中国省市区三级联动数据（用于地址选择组件）
import { provinceAndCityData, regionData } from "element-china-area-data";
// 导入VueSweetalert2插件（基于SweetAlert2的Vue适配插件，用于弹窗提示）
import VueSweetalert2 from "vue-sweetalert2";
// 导入SweetAlert2的样式文件（确保弹窗样式正常显示）
import "sweetalert2/dist/sweetalert2.min.css";

// 导入项目自定义样式文件（全局样式，统一页面风格）
import "./assets/css/editor.scss"; // 富文本编辑器相关样式
import "./assets/css/button.scss"; // 按钮组件自定义样式
import "./assets/css/elementui-cover.scss"; // Element UI组件样式覆盖（自定义主题）
import "./assets/css/basic.scss"; // 基础样式（如body、容器布局等）
import "./assets/css/dialog.scss"; // 弹窗组件自定义样式
import "./assets/css/input.scss"; // 输入框组件自定义样式

// 导入封装后的axios请求实例（统一配置基础路径、请求拦截器等）
import request from "@/utils/request";
// 导入md5加密库（用于密码加密等场景）
import md5 from "js-md5";

// 关闭Vue生产环境提示（减少控制台冗余警告，生产环境建议开启）
Vue.config.productionTip = false;

// 安装VueSweetalert2插件（全局注册弹窗组件）
Vue.use(VueSweetalert2);
// 全局挂载md5加密方法：所有Vue组件可通过this.$md5调用
Vue.prototype.$md5 = md5;
// 全局挂载axios请求实例：所有Vue组件可通过this.$axios发送HTTP请求
Vue.prototype.$axios = request;

// 导入自定义的swalPlugin弹窗插件（封装了确认型弹窗等常用功能）
import swalPlugin from "@/utils/swalPlugin";
// 安装自定义弹窗插件
Vue.use(swalPlugin);

// 创建Vue根实例（项目入口）
new Vue({
  router, // 注入路由实例，使整个应用支持路由功能
  regionData, // 注入省市区三级联动数据（供Element地址组件使用）
  provinceAndCityData, // 注入省市二级联动数据（供Element地址组件使用）
  VueSweetalert2, // 注入VueSweetalert2插件（可选，部分场景可能需要显式注入）
  render: h => h(App) // 渲染根组件App：将App组件挂载到页面的#app元素
}).$mount("#app"); // 挂载到页面中id为"app"的DOM元素（对应public/index.html中的<div id="app"></div>）
