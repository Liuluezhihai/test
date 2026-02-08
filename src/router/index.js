// 导入Vue核心库
import Vue from "vue";
// 导入Vue Router路由插件（用于实现页面路由跳转）
import VueRouter from "vue-router";
// 导入Element UI组件库（用于快速构建界面）
import ElementUI from "element-ui";
// 导入Element UI默认样式文件
import "element-ui/lib/theme-chalk/index.css";
// 导入获取本地存储token的工具函数（用于登录状态验证）
import { getToken, clearToken } from "@/utils/storage.js";
// 导入ECharts图表库（用于数据可视化）
import echarts from "echarts";

// 全局挂载ECharts实例，使所有Vue组件可通过this.$echarts访问
Vue.prototype.$echarts = echarts;
// 安装Element UI插件（全局注册Element UI组件）
Vue.use(ElementUI);
// 安装Vue Router插件（启用路由功能）
Vue.use(VueRouter);

// 定义路由规则数组：配置所有页面的路由路径、对应组件及路由元信息
const routes = [
  // 根路径路由：访问"/"时跳转到登录页
  { path: "/", component: () => import(`@/views/login/Login.vue`) },
  // 登录页路由：路径"/login"，对应登录组件（懒加载方式导入）
  { path: "/login", component: () => import(`@/views/login/Login.vue`) },
  // 注册页路由：路径"/register"，对应注册组件（懒加载）
  {
    path: "/register",
    component: () => import(`@/views/register/Register.vue`)
  },
  
  // 管理员主路由：嵌套路由容器，需登录认证
  {
    path: "/admin",
    component: () => import(`@/views/admin/Home.vue`), // 管理员布局组件
    meta: { requireAuth: true }, // 标记该路由及子路由需要登录才能访问
    children: [
      // 管理员子路由（嵌套在管理员布局内）
      // 数据总览路由：路径"/adminLayout"，对应数据总览组件，需登录认证
      {
        path: "/adminLayout",
        name: "数据总览",
        icon: "el-icon-data-analysis",
        component: () => import(`@/views/admin/Main.vue`),
        meta: { requireAuth: true }
      },
      // 用户管理路由：路径"/userManage"，对应用户管理组件，需登录认证
      {
        path: "/userManage",
        name: "用户管理",
        icon: "el-icon-user-solid",
        component: () => import(`@/views/admin/UserManage.vue`),
        meta: { requireAuth: true }
      },
      
      {
        path: "/bookcategoryManage",
        name: "书籍类别管理",
        icon: "el-icon-setting",
        component: () => import(`@/views/admin/BookCategoryManage.vue`),
        meta: { requireAuth: true }
      },
      {
        path: "/bookManage",
        name: "书籍管理",
        icon: "el-icon-s-management",
        component: () => import(`@/views/admin/BookManage.vue`),
        meta: { requireAuth: true }
      },
      {
        path: "/borrowRecordManage",
        name: "借阅记录管理",
        icon: "el-icon-s-order",
        component: () => import(`@/views/admin/BorrowRecordManage.vue`),
        meta: { requireAuth: true }
      },
      {
        path: "/examTypeManage",
        name: "考试分类管理",
        icon: "el-icon-edit",
        component: () => import(`@/views/admin/ExamTypeManage.vue`),
        meta: { requireAuth: true }
      },
      {
        path: "/studyManage",
        name: "考试资源管理",
        icon: "el-icon-edit-outline",
        component: () => import(`@/views/admin/StudyManage.vue`),
        meta: { requireAuth: true }
      }
    ]
  }
];

// 创建Vue Router实例，传入路由规则和路由模式
const router = new VueRouter({
  routes, // 路由规则数组
  mode: "history" // 路由模式：history模式（URL中无#，需后端配置支持）
});

// 路由守卫：全局前置守卫（在每次路由跳转前执行，用于登录验证和权限控制）
router.beforeEach((to, from, next) => {
  // 1. 放行登录页和注册页：无需登录即可访问
  if (to.path === "/login" || to.path === "/register") {
    return next(); // 直接跳转到目标路由
  }

  // 2. 检查目标路由是否需要登录认证（通过meta.requireAuth判断）
  if (to.matched.some(record => record.meta.requireAuth)) {
    // 获取本地存储的token（登录成功后存储的身份凭证）
    const token = getToken();

    // 2.1 未登录处理：无token则跳转到登录页，并记录目标路由（登录后可跳转回原目标页）
    if (!token) {
      return next({
        path: "/login", // 跳转目标：登录页
        query: { redirect: to.fullPath } // 携带原目标路由路径参数（redirect）
      });
    }

    // 2.2 已登录：进行角色权限校验
    try {
      // 从sessionStorage获取用户角色（1=管理员，2=普通用户），转换为数字类型
      const role = parseInt(sessionStorage.getItem("role"));

      // 2.2.1 管理员路由权限校验：访问/admin/*路径必须是管理员（role=1）
      if (to.matched[0].path === "/admin" && role !== 1) {
        clearToken(); // 权限不匹配，清除token（强制退出登录）
        return next("/login"); // 跳转到登录页
      }

      // 2.2.2 普通用户路由权限校验：访问/user/*路径必须是普通用户（role=2）
      if (to.matched[0].path === "/user" && role !== 2) {
        clearToken(); // 权限不匹配，清除token
        return next("/login"); // 跳转到登录页
      }

      // 权限校验通过，放行到目标路由
      return next();
    } catch (error) {
      // 角色获取失败或校验过程出错，打印错误日志并跳转到登录页
      console.error("权限检查失败:", error);
      return next("/login");
    }
  }

  // 3. 无需认证的普通页面（无meta.requireAuth），直接放行
  next();
});

// 导出路由实例，供Vue根组件使用
export default router;
