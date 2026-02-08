<template>
  <!-- 管理员页面根容器：左侧菜单 + 右侧主内容 + 个人中心弹窗 -->
  <div class="menu-container">
    <!-- 左侧菜单区域：支持宽窄模式切换 -->
    <div class="menu-side" :class="{ 'menu-side-narrow': flag }">
      <div style="display: flex; align-items: center;">
        <Logo
          name="考研/考公图书管理系统"
          style="padding: 0 40px; margin: 15px 0;"
          :flag="flag"
          :bag="colorLogo"
        />
      </div>
      <div style="margin-top: 12px;">
        <AdminMenu
          :flag="flag"
          :routes="adminRoutes"
          :bag="bagMenu"
          @select="handleRouteSelect"
        />
      </div>
    </div>

    <!-- 右侧主内容区域：顶部导航 + 页面内容 -->
    <div class="main">
      <div class="header-section">
        <LevelHeader
          @eventListener="eventListener"
          @selectOperation="selectOperation"
          :tag="tag"
          :userInfo="userInfo"
        />
      </div>
      <div class="content-section">
        <router-view></router-view>
      </div>
    </div>

    <!-- 个人中心弹窗 -->
    <el-dialog :show-close="false" :visible.sync="dialogOperaion" width="26%">
      <div slot="title" style="padding: 25px 0 0 20px;">
        <span style="font-size: 18px; font-weight: 800;">个人中心</span>
      </div>

      <el-row style="padding: 10px 20px 20px 20px;">
        <!-- 头像上传区域 -->
        <el-row>
          <p style="font-size: 12px; padding: 3px 0; margin-bottom: 10px;">
            <span class="modelName">*头像</span>
          </p>
          <el-upload
            class="avatar-uploader"
            action="/api/book-manage-sys-api/v1.0/file/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
          >
            <img
              v-if="userInfo.url"
              :src="userInfo.url"
              style="width: 80px; height: 80px;"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-row>

        <!-- 用户名输入区域 -->
        <el-row>
          <p style="font-size: 12px; padding: 3px 0;">
            <span class="modelName">*用户名</span>
          </p>
          <input
            class="input-title"
            v-model="userInfo.name"
            placeholder="用户名"
          />
        </el-row>

        <!-- 用户性别选择区域 -->
        <el-row class="form-row">
          <p style="font-size: 12px; padding: 3px 0; margin-bottom: 8px;">
            <span class="modelName">*用户性别</span>
          </p>
          <el-select
            class="input-title"
            v-model="userInfo.gender"
            placeholder="请选择用户性别"
            clearable
          >
            <el-option label="男" :value="1"></el-option>
            <el-option label="女" :value="2"></el-option>
            <el-option label="未知性别" :value="3"></el-option>
          </el-select>
        </el-row>

        <!-- ********** 修改后的真实姓名区域 ********** -->
        <el-row
          style="display: flex; align-items: center; margin-bottom: 15px;"
        >
          <div style="flex: 1;">
            <p style="font-size: 12px; padding: 3px 0;">
              <span class="modelName">*用户真实姓名</span>
            </p>
            <!-- 固定显示真实姓名，不再是输入框 -->
            <div
              class="input-title"
              style="background-color: #fafafa; cursor: default;"
            >
              {{ userInfo.realname || "未认证" }}
            </div>
          </div>
          <!-- 修改实名认证按钮 -->
          <el-button
            type="text"
            style="color: #15559a; margin-left: 10px; margin-top: 15px; padding: 0;"
            @click="openCertificationDialog"
          >
            <i class="el-icon-edit"></i> 修改认证
          </el-button>
        </el-row>

        <!-- 用户手机号输入区域 -->
        <el-row>
          <p style="font-size: 12px; padding: 3px 0;">
            <span class="modelName">*用户手机号</span>
          </p>
          <input
            class="input-title"
            v-model="userInfo.phone"
            placeholder="用户手机号"
          />
        </el-row>

        <!-- 用户邮箱输入区域 -->
        <el-row>
          <p style="font-size: 12px; padding: 3px 0;">
            <span class="modelName">*用户邮箱</span>
          </p>
          <input
            class="input-title"
            v-model="userInfo.email"
            placeholder="用户邮箱"
          />
        </el-row>
      </el-row>

      <!-- 弹窗底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button
          class="customer"
          size="small"
          style="background-color: rgb(241, 241, 241); border: none;"
          @click="dialogOperaion = false"
        >
          取 消
        </el-button>
        <el-button
          size="small"
          style="background-color: #15559a; border: none;"
          class="customer"
          type="info"
          @click="updateUserInfo"
        >
          修改
        </el-button>
      </span>
    </el-dialog>

    <!-- ********** 新增：修改实名认证弹窗 ********** -->
    <el-dialog
      title="修改实名认证"
      :visible.sync="isCertDialogOpen"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="certForm"
        :rules="certRules"
        ref="certFormRef"
        label-width="100px"
      >
        <el-form-item label="真实姓名" prop="realname">
          <el-input
            v-model="certForm.realname"
            placeholder="请输入真实姓名"
            maxlength="20"
            :disabled="!!userInfo.realname"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input
            v-model="certForm.idCard"
            placeholder="请输入18位身份证号"
            maxlength="18"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isCertDialogOpen = false">取消</el-button>
        <el-button type="primary" @click="submitCertification"
          >提交认证</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/utils/request.js";
import router from "@/router/index";
import { clearToken } from "@/utils/storage";
import AdminMenu from "@/components/VerticalMenu.vue";
import Logo from "@/components/Logo.vue";
import LevelHeader from "@/components/LevelHeader.vue";

export default {
  name: "Admin",
  components: {
    Logo,
    LevelHeader,
    AdminMenu
  },
  data() {
    return {
      adminRoutes: [],
      activeIndex: "",
      userInfo: {
        id: null,
        gender: null,
        realname: "", // 真实姓名（固定显示）
        phone: "",
        url: "",
        name: "",
        role: null,
        email: ""
      },
      flag: false,
      tag: "可视化",
      bag: "rgb(250, 250, 250)",
      colorLogo: "#1c1c1c",
      bagMenu: "rgb(250, 250, 250)",
      dialogOperaion: false,

      // ********** 新增：实名认证相关数据 **********
      isCertDialogOpen: false, // 实名认证弹窗显示状态
      certForm: {
        // 实名认证表单数据
        realname: "",
        idCard: ""
      },
      // 实名认证表单校验规则
      certRules: {
        realname: [
          { required: true, message: "请输入真实姓名", trigger: "blur" },
          {
            pattern: /^[\u4e00-\u9fa5]{2,20}$/,
            message: "请输入2-20位中文姓名",
            trigger: "blur"
          }
        ],
        idCard: [
          { required: true, message: "请输入身份证号", trigger: "blur" },
          {
            pattern: /(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
            message: "请输入有效的18位身份证号",
            trigger: "blur"
          }
        ]
      }
    };
  },
  created() {
    let menus = router.options.routes.filter(
      route => route.path === "/admin"
    )[0];
    this.adminRoutes = menus.children;
    this.tokenCheckLoad();
    this.menuOperationHistory();
  },
  methods: {
    // ********** 新增：打开实名认证弹窗 **********
    openCertificationDialog() {
      // 回显已有认证信息
      this.certForm = {
        realname: this.userInfo.realname || "",
        idCard: this.userInfo.idCard || ""
      };
      this.isCertDialogOpen = true;
    },

    // ********** 新增：提交实名认证（同步数据库） **********
    async submitCertification() {
      this.$refs.certFormRef.validate(async isValid => {
        if (isValid) {
          try {
            // 构造请求参数（包含用户ID和认证信息）
            const certData = {
              userId: this.userInfo.id, // 关联当前用户
              userRealname: this.certForm.realname,
              userCardId: this.certForm.idCard // 假设后端字段为userCardId（可根据实际调整）
            };

            // 调用后端实名认证接口（同步数据库）
            const response = await request.put(
              "/user/update-certification",
              certData
            );
            const { data } = response;

            if (data.code === 200) {
              // 更新本地用户信息（实时显示）
              this.userInfo.realname = this.certForm.realname;
              this.userInfo.idCard = this.certForm.idCard;

              // 关闭弹窗并提示
              this.isCertDialogOpen = false;
              this.$message.success("实名认证修改成功！");
            } else {
              this.$message.error(`认证失败：${data.msg}`);
            }
          } catch (e) {
            console.error("实名认证接口调用失败：", e);
            this.$message.error("网络异常，认证失败，请重试！");
          }
        } else {
          console.log("表单校验失败");
          return false;
        }
      });
    },

    // 原有方法保持不变
    async updateUserInfo() {
      try {
        const userUpdateDTO = {
          userId: this.userInfo.id,
          url: this.userInfo.url,
          userName: this.userInfo.name,
          email: this.userInfo.email, // 前端传 email
          gender: this.userInfo.gender,
          realName: this.userInfo.realname, // 已改为固定值，同步提交
          phone: this.userInfo.phone
        };

        const response = await this.$axios.put(`/user/update`, userUpdateDTO);
        const { data } = response;

        if (data.code === 200) {
          this.dialogOperaion = false;
          this.tokenCheckLoad();
          this.$swal.fire({
            title: "修改个人信息",
            text: data.msg,
            icon: "success",
            showConfirmButton: false,
            timer: 1000
          });
        }
      } catch (e) {
        this.dialogOperaion = false;
        this.$swal.fire({
          title: "修改个人信息异常",
          text: e.message || "未知错误",
          icon: "error",
          showConfirmButton: false,
          timer: 2000
        });
        console.error(`修改个人信息异常:`, e);
      }
    },

    // eslint-disable-next-line no-unused-vars
    handleAvatarSuccess(res, file) {
      if (res.code !== 200) {
        this.$message.error(`头像上传异常`);
        return;
      }
      this.$message.success(`头像上传成功`);
      this.userInfo.url = res.data;
    },

    eventListener(event) {
      if (event === "center") {
        this.dialogOperaion = true;
      }
      if (event === "loginOut") {
        this.loginOut();
      }
    },

    async loginOut() {
      const confirmed = await this.$swalConfirm({
        title: "退出登录？",
        text: `退出后需重新登录`,
        icon: "warning"
      });

      if (confirmed) {
        this.$swal.fire({
          title: "退出登录成功",
          text: "1s 后返回登录页面",
          icon: "success",
          showConfirmButton: false,
          timer: 1000
        });

        setTimeout(() => {
          clearToken();
          this.$router.push("/login");
        }, 1000);
      }
    },

    menuOperationHistory() {
      this.flag = sessionStorage.getItem("flag") === "true";
    },

    selectOperation(flag) {
      this.flag = flag;
      sessionStorage.setItem("flag", flag);
    },

    handleRouteSelect(index) {
      let ary = this.adminRoutes.filter(entity => entity.path === index);
      this.tag = ary[0].name;

      if (this.$router.currentRoute.fullPath === index) {
        return;
      }

      this.$router.push(index);
    },

    async tokenCheckLoad() {
      try {
        const res = await request.get("user/auth");

        if (res.data.code === 400) {
          this.$message.error(res.data.msg);
          this.$router.push("/login");
          return;
        }

        const {
          userId: id,
          url: url,
          userName: name,
          userRole: role,
          email: email,
          realName: realname,
          gender: gender, // 补充解析 gender 字段
          phone: phone, // 补充解析 phone 字段
          userType: userType
        } = res.data.data;
        // 加载用户信息时包含实名认证数据
        this.userInfo = {
          id,
          url,
          name,
          role,
          email,
          realname,
          gender,
          phone,
          userType
        };

        const rolePath = role === 1 ? "/admin" : "/user";
        const targetMenu = router.options.routes.find(
          route => route.path === rolePath
        );
        if (targetMenu) {
          this.routers = targetMenu.children;
        } else {
          console.warn(`未找到与角色对应的路由：${rolePath}`);
        }
      } catch (error) {
        console.error("获取用户认证信息时发生错误:", error);
        this.$message.error("认证信息加载失败，请重试！");
      }
    }
  }
};
</script>

<style scoped lang="scss">
.menu-container {
  display: flex;
  height: 100vh;
  width: 100%;

  .menu-side {
    width: 253px;
    min-width: 95px;
    height: 100vh;
    padding-top: 10px;
    box-sizing: border-box;
    transition: width 0.3s ease;
    background-color: rgb(250, 250, 250);
  }

  .menu-side-narrow {
    width: 115px;
  }

  .main {
    flex-grow: 1;
    overflow-x: hidden;

    .header-section {
      max-width: 100%;
      padding: 0 15px 0 0;
    }

    .content-section {
      overflow-x: hidden;
      flex-grow: 1;
      padding: 0 15px;
      box-sizing: border-box;
      overflow-y: auto;
    }
  }
}

.input-title {
  outline: none;
  border: 1px solid #e6e6e6;
  width: 100%;
  padding: 10px;
  font-size: 14px;
  box-sizing: border-box;
  border-radius: 4px;
  margin-bottom: 15px;
}

.modelName {
  color: #070707;
  margin-right: 8%;
}

.customer {
  color: #fff !important;
  border-radius: 4px !important;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  line-height: 80px;
  text-align: center;
  border: 1px dashed #dcdcdc;
  border-radius: 4px;
}

/* 实名认证弹窗按钮样式补充 */
.dialog-footer {
  text-align: right;
}
</style>
