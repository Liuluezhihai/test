<template>
  <!-- 登录页面根容器：全屏居中布局 -->
  <div class="login-container">
    <!-- 登录面板：带阴影的白色卡片 -->
    <div class="login-panel">
      <!-- Logo组件：显示系统名称和Logo -->
      <div class="logo">
        <Logo :bag="colorLogo" name="考研/考公图书管理系统" />
      </div>

      <!-- 账号输入框：双向绑定账号数据 -->
      <div class="text">
        <input v-model="act" class="act" placeholder="输入手机号" />
      </div>

      <!-- 密码输入框：双向绑定密码数据，类型为密码（隐藏输入） -->
      <div class="text">
        <input
          v-model="pwd"
          class="pwd"
          type="password"
          placeholder="输入密码"
        />
      </div>

      <!-- 登录按钮：点击触发登录逻辑 -->
      <div>
        <span class="login-btn" @click="login">立即登录</span>
      </div>

      <!-- 注册提示：点击跳转到注册页面 -->
      <div class="tip">
        <p>
          没有账号？<span class="no-act" @click="toDoRegister">点此注册</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
// 常量定义：角色类型（管理员=1，普通用户=2）、弹窗延迟时间（1300ms）
const ADMIN_ROLE = 1;
const USER_ROLE = 2;
const DELAY_TIME = 1300;

// 导入依赖：请求工具、token存储工具、MD5加密、Logo组件
import request from "@/utils/request.js";
import { setToken } from "@/utils/storage.js";
import Logo from "@/components/Logo.vue";

export default {
  name: "Login", // 组件名称
  components: { Logo }, // 注册Logo子组件
  // 组件内部数据
  data() {
    return {
      act: "", // 账号输入值
      pwd: "", // 密码输入值
      colorLogo: "rgb(38,38,38)" // Logo颜色
    };
  },
  // 组件创建生命周期钩子：页面加载时校验是否已登录
  created() {
    this.defaultLoad();
  },
  // 组件方法
  methods: {
    /**
     * 页面初始化加载：校验本地token，若已登录则自动跳转到对应角色页面
     */
    defaultLoad() {
      // 从sessionStorage获取token
      const token = sessionStorage.getItem("token");
      // 无token则直接返回（未登录状态）
      if (token === undefined || token === null || token === "") {
        return;
      }

      // 有token则校验有效性，获取用户信息
      this.$axios.get("user/auth").then(response => {
        const { data } = response;
        // token无效（状态码400），返回登录页
        if (data.code === 400) {
          return;
        }

        this.$router.push("/admin");
      });
    },

    /**
     * 跳转到注册页面
     */
    toDoRegister() {
      this.$router.push("/register");
    },

    /**
     * 登录逻辑：校验输入、加密密码、调用登录接口、处理登录结果
     */
    async login() {
      // 校验账号/密码是否为空
      if (!this.act || !this.pwd) {
        // 显示输入校验失败弹窗（1.3秒后自动关闭）
        this.$swal.fire({
          title: "填写校验",
          text: "账号或密码不能为空",
          icon: "error",
          showConfirmButton: false,
          timer: DELAY_TIME
        });
        return;
      }

      // 密码加密：双重MD5加密（与后端加密规则一致）
      // const hashedPwd = md5(md5(this.pwd));
      // 构造登录请求参数DTO
      const paramDTO = { phone: this.act, password: this.pwd };

      try {
        // 调用登录接口（POST请求）
        const { data } = await request.post(`user/login`, paramDTO);

        // 登录失败（状态码非200）
        if (data.code !== 200) {
          this.$swal.fire({
            title: "登录失败",
            text: data.msg, // 显示后端返回的失败原因
            icon: "error",
            showConfirmButton: false,
            timer: DELAY_TIME
          });
          return;
        }

        // 登录成功：存储token到sessionStorage
        setToken(data.data.token);

        // 显示登录成功弹窗（1.3秒后自动关闭）
        this.$swal.fire({
          title: "登录成功",
          text: "即将进入系统...",
          icon: "success",
          showConfirmButton: false,
          timer: DELAY_TIME
        });

        // 延迟跳转：根据用户角色跳转到对应页面
        setTimeout(() => {
          const { userRole } = data.data;
          sessionStorage.setItem("role", userRole); // 存储角色到本地
          this.navigateToRole(userRole); // 执行跳转
        }, DELAY_TIME);
      } catch (error) {
        // 登录请求异常（如网络错误、服务器异常）
        console.error("登录请求错误:", error);
        this.$message.error("登录请求出错，请重试！");
      }
    },

    /**
     * 根据角色跳转对应页面
     * @param {number} role - 角色标识（1=管理员，2=普通用户）
     */
    navigateToRole(role) {
      switch (role) {
        case ADMIN_ROLE:
          this.$router.push("/admin"); // 管理员→后台管理页面
          break;
        case USER_ROLE:
          this.$router.push("/user"); // 普通用户→用户端页面
          break;
        default:
          console.warn("未知的角色类型:", role); // 未知角色提示警告
          break;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/* 全局样式：禁止用户选择文本 */
* {
  user-select: none;
}

/* 登录页面根容器：全屏、白色背景、弹性布局居中 */
.login-container {
  width: 100%;
  min-height: 100vh;
  background-color: rgb(255, 255, 255);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  /* 登录面板：固定宽度、内边距、圆角、阴影 */
  .login-panel {
    width: 313px;
    height: auto;
    padding: 40px 30px 16px 30px;
    border-radius: 3px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06);

    /* Logo容器：上下外边距 */
    .logo {
      margin: 10px 0 30px 0;
    }

    /* 账号/密码输入框样式：统一高度、边框、内边距、圆角 */
    .act,
    .pwd {
      margin: 8px 0;
      height: 53px;
      line-height: 53px;
      width: 100%;
      font-size: 16px;
      padding: 0 15px;
      box-sizing: border-box;
      border: 2px solid #c8d4e7;
      border-radius: 6px;
      margin-top: 13px;
    }

    /* 输入框聚焦样式：橙色边框、过渡动画 */
    .act:focus,
    .pwd:focus {
      outline: none;
      border: 2px solid rgb(255, 126, 0);
      transition: 1.2s;
    }

    /* 角色选择标签样式（未使用，预留） */
    .role {
      display: inline-block;
      color: rgb(30, 102, 147);
      font-size: 14px;
      padding-right: 10px;
    }
  }

  /* 登录按钮样式：全屏宽度、橙色背景、白色文字、居中对齐 */
  .login-btn {
    display: inline-block;
    text-align: center;
    border-radius: 3px;
    margin-top: 20px;
    height: 43px;
    line-height: 43px;
    width: 100%;
    background-color: rgb(255, 126, 0);
    font-size: 14px !important;
    border: none;
    color: white;
    padding: 0 !important;
    cursor: pointer;
    user-select: none;
  }

  /* 注册提示样式：上下外边距、文字颜色 */
  .tip {
    margin: 20px 0;

    p {
      padding: 3px 0;
      margin: 0;
      font-size: 14px;
      color: #647897;

      i {
        margin-right: 3px;
      }

      span {
        color: #3b3c3e;
        border-radius: 2px;
        margin: 0 6px;
      }

      /* 注册链接hover样式：蓝色文字 */
      .no-act:hover {
        color: #3e77c2;
        cursor: pointer;
      }
    }
  }
}
</style>
