<template>
  <!-- 用户管理页面根容器：白色背景，上下内边距20px，圆角5px -->
  <el-row
    style="background-color: #FFFFFF; padding: 20px 0; border-radius: 5px;"
  >
    <!-- 筛选条件区域：内边距10px，左右外边距10px -->
    <el-row style="padding: 10px; margin: 0 10px;">
      <el-row>
        <!-- 用户名筛选标签 -->
        <span class="top-bar">用户名</span>
        <!-- 用户名输入框：双向绑定查询条件，支持清空，清空触发筛选重置 -->
        <el-input
          size="small"
          style="width: 188px; margin-right: 10px;"
          v-model="userQueryDto.userName"
          placeholder="用户名"
          clearable
          @clear="handleFilterClear"
        ></el-input>

        <!-- 注册时间筛选标签 -->
        <span class="top-bar">注册时间</span>
        <!-- 日期范围选择器：双向绑定时间范围，支持选择起始/结束时间 -->
        <el-date-picker
          size="small"
          style="width: 220px;"
          v-model="searchTime"
          type="daterange"
          range-separator="至"
          start-placeholder="起始时间"
          end-placeholder="结束时间"
        ></el-date-picker>

        <!-- 立即查询按钮：点击触发筛选查询 -->
        <el-button
          size="small"
          class="customer"
          style="background-color: rgb(235, 237, 245); color: rgb(43, 121, 203); border: none;"
          type="primary"
          @click="handleFilter"
        >
          立即查询
        </el-button>

        <!-- 新增用户按钮：点击显示新增用户弹窗 -->
        <el-button
          size="small"
          style="background-color: rgb(235, 237, 245); color: rgb(43, 121, 203); border: none;"
          class="customer"
          type="info"
          @click="add()"
        >
          新增用户
        </el-button>

        <!-- 批量删除按钮：根据选中行数量动态切换样式（有选中时红色，无选中时灰色） -->
        <el-button
          size="small"
          class="customer"
          :style="{
            marginLeft: '10px',
            backgroundColor: selectedRows.length ? '#a7535a' : '#F1F1F1',
            border: 'none',
            color: selectedRows.length ? '#FFFFFF' : '#909399'
          }"
          type="danger"
          @click="batchDelete()"
        >
          批量删除
        </el-button>

        <!-- 条件重置按钮：点击重置所有筛选条件并重新查询 -->
        <el-button
          size="small"
          class="customer reset"
          style="background-color: #f1f1f1; border: none; color: #909399; border: 1px solid #f1f1f1;"
          type="info"
          @click="resetQueryCondition"
        >
          条件重置
        </el-button>
      </el-row>
    </el-row>

    <!-- 表格及分页区域：左右外边距20px，上下外边距10px -->
    <el-row style="margin: 10px 20px;">
      <!-- 用户列表表格：支持多选，绑定表格数据 -->
      <el-table
        row-key="userId"
        @selection-change="handleSelectionChange"
        :data="tableData"
        style="width: 100%"
      >
        <!-- 修复：主键从id改为userId（后端User实体主键是userId） -->
        <!-- 多选列：宽度55px -->
        <el-table-column type="selection" width="55"></el-table-column>
        <!-- 头像列：显示用户头像，宽度68px -->
        <el-table-column prop="url" width="68" label="头像">
          <template slot-scope="scope">
            <!-- Element UI 头像组件：尺寸30px，绑定用户头像地址 -->
            <el-avatar
              :size="30"
              :src="scope.row.url"
              style="margin-top: 10px;"
            ></el-avatar>
          </template>
        </el-table-column>
        <!-- 用户名列：绑定userName字段，宽度148px -->
        <el-table-column
          prop="userName"
          width="148"
          label="名称"
        ></el-table-column>
        <!-- 账号列：绑定phone字段（后端用phone作为账号，替换原userAccount），宽度128px -->
        <el-table-column
          prop="phone"
          width="128"
          label="手机号"
        ></el-table-column>
        <!-- 用户邮箱列：绑定email字段（后端字段是email，替换原userEmail），宽度168px -->
        <el-table-column
          prop="email"
          width="168"
          label="用户邮箱"
        ></el-table-column>
        <!-- 角色列：绑定userRole字段，宽度68px（1=管理员，其他=普通用户） -->
        <el-table-column prop="userRole" width="68" label="角色">
          <template slot-scope="scope">
            <span>{{ scope.row.userRole === 1 ? "管理员" : "用户" }}</span>
          </template>
        </el-table-column>
        <!-- 封号列：开关控制用户状态（后端userStatus：1=正常，2=禁用），宽度108px -->
        <el-table-column prop="userStatus" width="108" label="封号">
          <template slot-scope="scope">
            <!-- 开关组件：绑定userStatus（1=正常=关闭，2=禁用=开启），切换触发状态更新 -->
            <el-switch
              @change="
                handleSwitchChange(
                  scope.row.userId,
                  scope.row.userStatus,
                  scope.row.userStatus === 1 ? 2 : 1
                )
              "
              style="user-select: none;"
              v-model="scope.row.userStatus"
              :active-value="2"
              :inactive-value="1"
              active-color="rgb(226, 226, 226)"
              inactive-color="#13ce66"
            >
            </el-switch>
          </template>
        </el-table-column>
        <!-- 注册时间列：绑定registerDate字段，支持排序，宽度168px -->
        <el-table-column
          :sortable="true"
          prop="registerDate"
          width="168"
          label="注册于"
        ></el-table-column>
        <!-- 操作列：包含编辑、删除按钮 -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 编辑按钮：点击触发单行编辑逻辑 -->
            <span class="text-button" @click="handleEdit(scope.row)">编辑</span>
            <!-- 删除按钮：点击触发单行删除逻辑 -->
            <span class="text-button" @click="handleDelete(scope.row)"
              >删除</span
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件：右侧对齐，支持页码切换、每页条数切换 -->
      <el-pagination
        style="margin: 20px 0; float: right;"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pureCurrentPage"
        :page-sizes="[5, 7]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
      ></el-pagination>
    </el-row>

    <!-- 新增/编辑用户弹窗（操作面板）：修复问题+圆角样式 -->
    <el-dialog
      :show-close="false"
      :visible.sync="dialogUserOperaion"
      width="50%"
      top="40px"
      :before-close="handleDialogClose"
      class="custom-dialog"
    >
      <!-- 弹窗标题：优化样式，增加底部分隔线 -->
      <div slot="title" class="dialog-title-wrap">
        <p class="dialog-title">
          {{ !isOperation ? "新增新用户" : "编辑用户信息" }}
        </p>
      </div>

      <!-- 弹窗内容区域：整洁表单布局 -->
      <div class="dialog-content">
        <!-- 头像上传区域：居中显示，优化样式 -->
        <div class="avatar-section">
          <el-upload
            class="avatar-uploader"
            action="/api/book-manage-sys-api/v1.0/file/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
          >
            <img v-if="data.url" :src="data.url" class="dialog-avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <p class="avatar-tip">点击上传/更换头像（建议100x100px）</p>
        </div>

        <!-- 表单输入区域：2列网格布局，整齐有序 -->
        <div class="form-grid">
          <!-- 用户名 -->
          <div class="form-item">
            <label class="form-label"
              >用户名 <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model="data.userName"
              placeholder="请输入用户名"
              :disabled="isOperation && !canEditBaseInfo"
            />
          </div>

          <!-- 真实姓名（新增字段） -->
          <div class="form-item">
            <label class="form-label"
              >真实姓名 <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model="data.realName"
              placeholder="请输入真实姓名"
            />
          </div>

          <!-- 账号（手机号） -->
          <div class="form-item">
            <label class="form-label"
              >手机号（账号） <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model="data.phone"
              placeholder="请输入手机号（作为登录账号）"
              :disabled="isOperation"
            />
          </div>

          <!-- 性别（新增字段） -->
          <div class="form-item">
            <label class="form-label"
              >性别 <span class="required">*</span></label
            >
            <el-select
              v-model="data.gender"
              placeholder="请选择性别"
              class="form-select"
            >
              <el-option label="男" :value="1"></el-option>
              <el-option label="女" :value="2"></el-option>
              <el-option label="未知" :value="0"></el-option>
            </el-select>
          </div>

          <!-- 邮箱 -->
          <div class="form-item">
            <label class="form-label">邮箱</label>
            <input
              class="form-input"
              v-model="data.email"
              placeholder="请输入邮箱"
            />
          </div>

          <!-- 用户类型（新增字段） -->
          <div class="form-item">
            <label class="form-label"
              >用户类型 <span class="required">*</span></label
            >
            <el-select
              v-model="data.userType"
              placeholder="请选择用户类型"
              class="form-select"
            >
              <el-option label="考研用户" :value="1"></el-option>
              <el-option label="考公用户" :value="2"></el-option>
              <el-option label="通用用户" :value="3"></el-option>
            </el-select>
          </div>

          <!-- 密码 -->
          <div class="form-item">
            <label class="form-label"
              >密码 <span class="required" v-if="!isOperation">*</span></label
            >
            <input
              class="form-input"
              v-model="userPwd"
              type="password"
              placeholder="新增必填，编辑可选（不填则不修改）"
            />
          </div>

          <!-- 用户角色 -->
          <div class="form-item">
            <label class="form-label"
              >用户角色 <span class="required">*</span></label
            >
            <el-select
              v-model="data.userRole"
              placeholder="请选择用户角色"
              class="form-select"
            >
              <el-option label="普通用户" :value="2"></el-option>
              <el-option label="管理员" :value="1"></el-option>
            </el-select>
          </div>

          <!-- 用户状态（新增字段，仅编辑显示） -->
          <div class="form-item" v-if="isOperation">
            <label class="form-label"
              >用户状态 <span class="required">*</span></label
            >
            <el-select
              v-model="data.userStatus"
              placeholder="请选择用户状态"
              class="form-select"
            >
              <el-option label="正常" :value="1"></el-option>
              <el-option label="禁用（封号）" :value="2"></el-option>
            </el-select>
          </div>

          <!-- 注册日期（新增字段，仅编辑显示） -->
          <div class="form-item" v-if="isOperation">
            <label class="form-label">注册日期</label>
            <input
              class="form-input"
              :value="formatDate(data.registerDate)"
              placeholder="注册日期"
              disabled
            />
          </div>
        </div>
      </div>

      <!-- 弹窗底部按钮区域：优化样式，居中对齐 -->
      <span slot="footer" class="dialog-footer">
        <!-- 新增按钮：仅新增时显示 -->
        <el-button
          size="small"
          v-if="!isOperation"
          class="submit-btn"
          type="primary"
          @click="addOperation"
        >
          确认新增
        </el-button>
        <!-- 修改按钮：仅编辑时显示 -->
        <el-button
          size="small"
          v-else
          class="submit-btn"
          type="primary"
          @click="updateOperation"
        >
          保存修改
        </el-button>
        <!-- 取消按钮：修复关闭逻辑 -->
        <el-button size="small" class="cancel-btn" @click="handleDialogClose">
          取消
        </el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
// 导入MD5加密（如果全局未挂载）
import md5 from "js-md5";

export default {
  // 组件内部数据：修复编辑不显示+新增字段初始化
  data() {
    return {
      userPwd: "", // 新增/编辑用户时的密码输入
      data: {
        url: "",
        realName: "", // 新增：真实姓名
        gender: 0, // 新增：性别（0=未知，1=男，2=女）
        userType: 1, // 新增：用户类型（默认普通用户）
        userRole: 2, // 新增：默认普通用户角色
        userStatus: 1, // 新增：默认正常状态
        phone: "", // 新增：手机号
        email: "" // 新增：邮箱
      },
      filterText: "", // 筛选文本（未使用）
    
      pageSize: 7, // 每页条数（默认7条）
      totalItems: 1, // 总数据条数（用于分页）
      dialogMessageOperation: false, // 消息推送弹窗显示状态（false=隐藏，true=显示）
      dialogUserOperaion: false, // 新增/编辑用户弹窗显示状态（false=隐藏，true=显示）
      isOperation: false, // 操作类型标识（false=新增，true=编辑）
      tableData: [], // 用户列表表格数据
      searchTime: [], // 注册时间范围（数组：[起始时间, 结束时间]）
      selectedRows: [], // 表格选中行数据（用于批量操作）
      status: null, // 预留状态参数（未使用）
      userQueryDto: {}, // 用户查询条件DTO（存储筛选参数：用户名、注册时间等）
      messsageContent: "", // 消息内容（未使用，冗余字段）
      pureCurrentPage: 1, // 纯净的页码（用于分页组件）
      canEditBaseInfo: true // 控制是否允许修改用户名（默认允许）
    };
  },
  // 监听属性：修复弹窗关闭时的操作类型切换逻辑（原逻辑导致编辑弹窗不显示）
  watch: {
    dialogUserOperaion(v1, v2) {
      // 修复：仅在新增弹窗关闭时切换操作类型，编辑弹窗关闭不切换
      // 原逻辑：每次关闭弹窗都切换isOperation，导致编辑时isOperation=true→false，弹窗无法显示
      if (!v1 && v2 && !this.isOperation) {
        // 新增弹窗从隐藏→显示，无需切换
      } else if (!v1 && this.isOperation) {
        // 编辑弹窗关闭，重置操作类型
        this.isOperation = false;
      }
      // 弹窗从显示变为隐藏时，清空表单
      if (!v1 && v2) {
        this.clearFormData();
      }
    }
  },
  // 组件创建生命周期钩子：组件实例创建后加载初始化数据
  created() {
    this.fetchFreshData();
  },
  // 组件方法：修复弹窗相关逻辑
  methods: {
    /**
     * 新增：日期格式化方法（用于注册日期显示）
     */
    formatDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${date
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;
    },

    /**
     * 修复：弹窗关闭统一处理方法（解决新增弹窗无法关闭问题）
     */
    handleDialogClose() {
      this.dialogUserOperaion = false;
      // 延迟清空表单，避免关闭时闪烁
      setTimeout(() => {
        this.clearFormData();
        // 编辑弹窗关闭后重置操作类型
        if (this.isOperation) {
          this.isOperation = false;
        }
      }, 300);
    },

    /**
     * 头像上传成功回调：处理上传结果
     * @param {Object} res - 接口响应数据
     * @param {File} file - 上传的文件对象
     */
    // eslint-disable-next-line no-unused-vars
    handleAvatarSuccess(res, file) {
      if (res.code !== 200) {
        this.$message.error(`用户头像上传异常`);
        return;
      }
      this.$message.success(`用户头像上传成功`);
      this.data.url = res.data;
      console.log("用户数据（含头像）：", this.data);
    },

    /**
     * 开关状态变化后刷新数据（预留方法，未使用）
     */
    switchChange() {
      this.fetchFreshData();
    },
    /**
     * 处理开关状态变化：正确传递状态（开关开启=2=禁用，关闭=1=正常）
     * @param {number} userId - 用户ID
     * @param {number} oldStatus - 切换前的原始状态（用于异常回滚）
     *
     */
    async handleSwitchChange(userId, isSwitchOn, oldStatus) {
      try {
        // 2. 根据映射规则计算目标状态：开启→2（禁用），关闭→1（正常）
        const newStatus = oldStatus == 1 ? 2 : 1;

        console.log(
          `用户ID：${userId}，切换前状态：${oldStatus}，切换后状态：${newStatus}`
        );
        // 3. 构造请求参数（确保传递正确的 newStatus）
        const param = { userId: userId, userStatus: newStatus };
        const response = await this.$axios.put(`/user/backUpdate`, param);

        if (response.data.code === 200) {
          this.$swal.fire({
            title: "账号状态",
            text: newStatus === 1 ? "账号已启用" : "账号已禁用",
            icon: "success",
            showConfirmButton: false,
            timer: 1200
          });
          // 同步更新表格数据（确保开关状态与后端一致）
          this.tableData.forEach(item => {
            if (item.userId === userId) {
              item.userStatus = newStatus;
            }
          });
        } else {
          // 接口失败：回滚到原始状态（避免开关与后端数据不一致）
          this.tableData.forEach(item => {
            if (item.userId === userId) {
              item.userStatus = oldStatus;
            }
          });
          this.$message.error("状态更新失败，请重试");
        }
      } catch (e) {
        console.error(`更新用户状态异常：${e}`);
        // 网络异常：同样回滚状态
        this.tableData.forEach(item => {
          if (item.userId === userId) {
            item.userStatus = oldStatus;
          }
        });
        this.$message.error("网络异常，状态更新失败");
      }
    },

    /**
     * 表格多选事件：同步选中行数据到selectedRows
     * @param {Array} selection - 选中的行数据数组
     */
    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    /**
     * 批量删除用户：校验选中状态，显示确认弹窗，调用后端批量删除接口
     */
    async batchDelete() {
      if (!this.selectedRows.length) {
        this.$message(`未选中任何数据`);
        return;
      }
      const confirmed = await this.$swalConfirm({
        title: "删除用户数据",
        text: `删除后不可恢复，是否继续？`,
        icon: "warning"
      });
      if (confirmed) {
        try {
          let userIds = this.selectedRows.map(entity => entity.userId);
          const response = await this.$axios.post(`/user/batchDelete`, userIds);
          if (response.data.code === 200) {
            this.$swal.fire({
              title: "删除提示",
              text: response.data.msg,
              icon: "success",
              showConfirmButton: false,
              timer: 2000
            });
            this.fetchFreshData();
            return;
          }
        } catch (e) {
          this.$swal.fire({
            title: "错误提示",
            text: e.message || "删除失败",
            icon: "error",
            showConfirmButton: false,
            timer: 2000
          });
          console.error(`用户信息删除异常：`, e);
        }
      }
    },

    /**
     * 重置查询条件：清空筛选参数，重新加载数据
     */
    resetQueryCondition() {
      this.userQueryDto = {};
      this.searchTime = [];
      this.fetchFreshData();
      this.pureCurrentPage = 1;
    },

    /**
     * 编辑用户：提交修改后的用户信息，调用后端更新接口
     */
    async updateOperation() {
      if (!this.data.userName || !this.data.phone||!this.data.email) {
        this.$swal.fire({
          title: "校验失败",
          text: "用户名、手机号、邮箱不能为空",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
          position: "fixed",
          appendTo: document.body,
          zIndex: 9999
        });
        return;
      }
      const updateData = { ...this.data };
      if (this.userPwd.trim() !== "") {
        updateData.password = md5(md5(this.userPwd));
      } else {
        delete updateData.password;
      }
      try {
        const response = await this.$axios.put("/user/backUpdate", updateData);
        this.$swal.fire({
          title: "用户信息修改",
          text: response.data.msg,
          icon: response.data.code === 200 ? "success" : "error",
          showConfirmButton: false,
          timer: 1000
        });
        if (response.data.code === 200) {
          this.handleDialogClose(); // 修复：使用统一关闭方法
          this.fetchFreshData();
        }
      } catch (error) {
        console.error("提交表单时出错:", error);
        this.$message.error("提交失败，请稍后再试！");
      }
    },

    /**
     * 新增用户：提交新增用户信息，调用后端新增接口
     */
    async addOperation() {
      // 新增姓名、性别校验
      if (!this.data.userName || !this.data.phone) {
        this.$swal.fire({
          title: "校验失败",
          text: "用户名、手机号不能为空",
          icon: "error",
          showConfirmButton: false,
          timer: 1500
        });

        // 关键：获取弹窗容器，强制修改内联样式
        const swalContainer = document.querySelector(".swal2-container");
        if (swalContainer) {
          swalContainer.style.zIndex = "2147483647";
          swalContainer.style.display = "flex";
          swalContainer.style.overflow = "visible";
          swalContainer.style.alignItems = "center";
          swalContainer.style.justifyContent = "center";
        }
        return;
      }
      const addData = {
        ...this.data,
        password: this.userPwd,
        userRole: this.data.userRole || 2,
        userStatus: this.data.userStatus || 1
      };
      try {
        const response = await this.$axios.post("/user/insert", addData);
        this.$message[response.data.code === 200 ? "success" : "error"](
          response.data.msg
        );
        if (response.data.code === 200) {
          this.handleDialogClose(); // 修复：使用统一关闭方法
          this.fetchFreshData();
        }
      } catch (error) {
        console.error("提交表单时出错:", error);
        this.$message.error("提交失败，请稍后再试！");
      }
    },

    /**
     * 关闭新增/编辑用户弹窗（兼容旧逻辑，实际使用handleDialogClose）
     */
    closeDialog() {
      this.handleDialogClose();
    },

    /**
     * 清空表单数据：修复新增字段清空逻辑
     */
    clearFormData() {
      this.data = {
        url: "",
        realName: "",
        gender: 0,
        userType: 1,
        userRole: 2,
        userStatus: 1,
        phone: "",
        email: ""
      };
      this.userPwd = "";
    },

    /**
     * 加载用户列表数据：构造查询参数，调用后端接口，更新表格和分页信息
     */
    async fetchFreshData() {
      try {
        this.tableData = [];
        let startTime = null;
        let endTime = null;
        if (this.searchTime && this.searchTime.length === 2) {
          const startDate = this.searchTime[0].toISOString();
          const endDate = this.searchTime[1].toISOString();
          startTime = `${startDate.split("T")[0]}T00:00:00`;
          endTime = `${endDate.split("T")[0]}T23:59:59`;
        }
        const params = {
          key: this.filterText,
          startTime: startTime,
          endTime: endTime,
          userName: this.userQueryDto.userName,
          current: this.pureCurrentPage,
          size: this.pageSize
        };
        const response = await this.$axios.post("/user/query", params);
        const { data } = response;
        this.tableData = data.data;
        this.totalItems = data.total;
      } catch (error) {
        console.error("查询用户信息异常:", error);
      }
    },

    /**
     * 显示新增用户弹窗：修复弹窗显示逻辑
     */
    add() {
      this.isOperation = false; // 明确标记为新增操作
      this.clearFormData(); // 打开前清空表单
      this.dialogUserOperaion = true;
    },

    /**
     * 筛选查询：重置页码为第1页，重新加载数据
     */
    handleFilter() {
      this.pureCurrentPage = 1;
      this.fetchFreshData();
    },

    /**
     * 筛选条件清空：清空筛选文本，触发筛选查询
     */
    handleFilterClear() {
      this.filterText = "";
      this.handleFilter();
    },

    /**
     * 每页条数改变事件：更新每页条数，重置页码为第1页，重新加载数据
     * @param {number} val - 新的每页条数
     */
    handleSizeChange(val) {
      this.pageSize = val;
      this.pureCurrentPage = 1;
      this.fetchFreshData();
    },

    /**
     * 页码改变事件：更新当前页码，重新加载数据
     * @param {number} val - 新的页码
     */
    handleCurrentChange(val) {
      this.pureCurrentPage = val;
      this.fetchFreshData();
    },

    /**
     * 消息推送：显示消息推送弹窗，存储当前用户ID
     * @param {Object} row - 选中的用户行数据
     */
    messagePush(row) {
      this.dialogMessageOperation = true;
      this.data = { ...row };
    },

    /**
     * 编辑用户：修复弹窗显示逻辑（原逻辑isOperation状态冲突）
     * @param {Object} row - 选中的用户行数据
     */
    handleEdit(row) {
      this.isOperation = true; // 明确标记为编辑操作
      // 回显数据，兼容新增字段
      this.data = {
        ...row,
        realName: row.realName || "",
        gender: row.gender !== undefined ? row.gender : 0,
        userType: row.userType || 1,
        userRole: row.userRole || 2,
        userStatus: row.userStatus || 1,
        phone: row.phone || "",
        email: row.email || ""
      };
      this.userPwd = "";
      this.dialogUserOperaion = true; // 显示弹窗
    },

    /**
     * 删除单条用户：将当前行添加到选中行数组，调用批量删除方法（复用逻辑）
     * @param {Object} row - 选中的用户行数据
     */
    handleDelete(row) {
      this.selectedRows = [row];
      this.batchDelete();
    }
  }
};
</script>

<style scoped lang="scss">
/* 标签提示样式（未使用，预留） */
.tag-tip {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 5px;
  background-color: rgb(245, 245, 245);
  color: rgb(104, 118, 130);
}

/* 输入框默认样式（未使用，预留） */
.input-def {
  height: 40px;
  line-height: 40px;
  outline: none;
  border: none;
  font-size: 20px;
  color: rgb(102, 102, 102);
  font-weight: 900;
  width: 100%;
}

/* 弹窗底部按钮容器：水平居中对齐 */
.dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 弹窗按钮样式：统一间距和圆角 */
.customer {
  margin: 0 8px;
  border-radius: 4px !important;
}

/* 筛选条件标签样式：统一字体和颜色 */
.top-bar {
  display: inline-block;
  margin-right: 8px;
  font-size: 14px;
  color: #606266;
}

/* 表格操作按钮样式：统一颜色和交互效果 */
.text-button {
  display: inline-block;
  margin: 0 8px;
  color: rgb(43, 121, 203);
  cursor: pointer;

  &:hover {
    text-decoration: underline; // hover时添加下划线
  }
}

/* 弹窗表单标签样式：统一间距和字体 */
.dialog-hover {
  display: inline-block;
  width: 60px;
  margin: 10px 0;
  font-size: 14px;
  color: #606266;
}

/* 弹窗表单输入框样式：统一尺寸和边框 */
.dialog-input {
  width: calc(100% - 70px);
  margin: 10px 0;
  padding: 8px 10px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: rgb(43, 121, 203); // 聚焦时边框变色
  }
}

/* 弹窗头像样式：统一尺寸和圆角 */
.dialog-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

/* 弹窗标题样式：统一字体和间距 */
.dialog-title {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  padding: 5px 0;
}

/* 头像上传图标样式：统一尺寸和边框 */
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  line-height: 80px;
  text-align: center;
  border: 1px dashed #dcdcdc;
  border-radius: 50%;
}

/* 弹窗标题样式 */
.dialog-title-wrap {
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 弹窗内容区域 */
.dialog-content {
  padding: 0 30px 10px;
}

/* 头像区域样式 */
.avatar-section {
  text-align: center;
  margin-bottom: 25px;
}

.dialog-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #dcdcdc;
  border-radius: 50%;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #409eff;
  }
}

.avatar-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

/* 表单网格布局 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 表单项样式 */
.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.required {
  color: #f56c6c;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  height: 36px;
  /* 强制固定高度（关键） */
  box-sizing: border-box;
  /* 确保内边距不影响高度 */

  &:focus {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
  }

  &:disabled {
    background-color: #fafafa;
    color: #999;
    cursor: not-allowed;
  }
}

.form-select {
  width: 100%;
  padding: 0px 12px;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.3s ease;
  height: 36px;
  /* 强制固定高度（与输入框一致） */
  box-sizing: border-box;

  &:focus {
    border-color: #409eff;
  }
}

/* 底部按钮区域 */
.dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 0 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 10px;
}

.submit-btn {
  background-color: #409eff !important;
  color: #fff !important;
  border: none !important;
  border-radius: 6px !important;
  padding: 6px 22px !important;
  margin-right: 12px !important;

  &:hover {
    background-color: #2694ff !important;
  }
}

.cancel-btn {
  border-radius: 6px !important;
  padding: 6px 22px !important;
  border: 1px solid #e6e6e6 !important;
  color: #666 !important;
  background-color: #f5f5f5 !important;

  &:hover {
    background-color: #eee !important;
  }
}

/* 适配小屏幕：表单改为1列 */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .el-dialog {
    width: 90% !important;
  }
}

/* 修复：弹窗圆角样式（关键） */
.custom-dialog {
  border-radius: 12px !important;
  // overflow: scroll;
  /* 确保内容不超出圆角 */
}

::v-deep .el-dialog__body {
  padding: 20px !important; // 恢复内边距（避免内容贴边）
  max-height: calc(100vh - 200px); // 限制最大高度（视口高度 - 弹窗上下边距）
  overflow-y: auto; // 纵向滚动
  overflow-x: hidden; // 禁止横向滚动
}
/* 覆盖Element UI下拉框的默认样式（关键修复） */
::v-deep .el-select .el-input__wrapper {
  height: 36px !important;
  /* 外层容器高度 */
  padding: 0 !important;
  border: 1px solid #e6e6e6 !important;
  /* 还原外层边框 */
  border-radius: 6px !important;
}

::v-deep .el-select .el-input__inner {
  height: 34px !important;
  /* 内层输入框高度（比外层小2px，适配边框） */
  line-height: 34px !important;
  /* 字体垂直居中 */
  padding: 0 !important;
  /* 内边距与输入框一致 */
  border: none !important;
  /* 内层无额外边框 */
  font-size: 14px !important;
  /* 字体大小与输入框一致 */
}

::v-deep .el-select .el-input__suffix {
  height: 34px !important;
  /* 下拉箭头区域高度 */
  line-height: 34px !important;
}
:global(.swal2-container.swal2-center.swal2-backdrop-show) {
  /* 解决层级问题 */
  z-index: 2147483647 !important;
  position: fixed !important;
  inset: 0 !important;

  /* 解决内容截断问题 */
  overflow: visible !important;
  /* 替换 auto */
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
/* 解除 body 的 overflow 限制 */
:global(body.el-popup-parent--hidden.swal2-shown) {
  overflow: visible !important;
}

/* 解除 #app 的隐藏标记影响 */
:global(#app[aria-hidden="true"]) {
  visibility: visible !important;
  pointer-events: auto !important;
}
//
//
:global(.swal2-container, .swal2-shown, .swal2-height-auto, .el-popup-parent--hidden) {
  z-index: 2147483647 !important; // 覆盖默认的 1060
  display: flex !important; // 覆盖默认的 grid
}
</style>
