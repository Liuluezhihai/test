<template>
  <!-- 学习资料管理页面根容器：白色背景，上下内边距20px，圆角5px -->
  <el-row
    style="background-color: #FFFFFF; padding: 20px 0; border-radius: 5px;"
  >
    <!-- 筛选条件区域：内边距10px，左右外边距10px -->
    <el-row style="padding: 10px; margin: 0 10px;">
      <el-row>
        <!-- 书籍名称筛选标签（替换书籍ID） -->
        <span class="top-bar">书籍名称</span>
        <!-- 书籍名称搜索选择框（添加 filterable 和自定义搜索逻辑） -->
        <el-select
          size="small"
          style="width: 140px; margin-right: 10px;"
          v-model="materialQueryDto.bookId"
          placeholder="搜索书籍名称"
          clearable
          @clear="handleFilterClear"
          filterable
          :filter-method="filterBookMethod"
        >
          <!-- 增加加载状态提示 -->
          <el-option
            v-if="bookList.length === 0"
            value=""
            label="加载中..."
          ></el-option>
          <el-option
            v-for="book in filteredBookList"
            :key="book.bookId"
            :label="book.bookName"
            :value="book.bookId"
          ></el-option>
        </el-select>

        <!-- 资料类型筛选标签 -->
        <span class="top-bar">资料类型</span>
        <el-select
          size="small"
          style="width: 140px; margin-right: 10px;"
          v-model="materialQueryDto.materialType"
          placeholder="选择资料类型"
          clearable
        >
          <el-option label="习题" value="习题"></el-option>
          <el-option label="视频" value="视频"></el-option>
          <el-option label="教案" value="教案"></el-option>
          <el-option label="课件" value="课件"></el-option>
        </el-select>

        <!-- 审核状态筛选标签 -->
        <span class="top-bar">审核状态</span>
        <el-select
          size="small"
          style="width: 140px; margin-right: 10px;"
          v-model="materialQueryDto.auditStatus"
          placeholder="选择审核状态"
          clearable
        >
          <el-option label="未审核" value="0"></el-option>
          <el-option label="审核通过" value="1"></el-option>
          <el-option label="审核拒绝" value="2"></el-option>
        </el-select>

        <!-- 上传时间筛选标签 -->
        <span class="top-bar">上传时间</span>
        <el-date-picker
          size="small"
          style="width: 220px; margin-right: 10px;"
          v-model="searchTime"
          type="daterange"
          range-separator="至"
          start-placeholder="起始时间"
          end-placeholder="结束时间"
        ></el-date-picker>

        <!-- 立即查询按钮 -->
        <el-button
          size="small"
          class="customer"
          style="background-color: rgb(235, 237, 245); color: rgb(43, 121, 203); border: none;"
          type="primary"
          @click="handleFilter"
        >
          立即查询
        </el-button>

        <!-- 新增资料按钮 -->
        <el-button
          size="small"
          style="background-color: rgb(235, 237, 245); color: rgb(43, 121, 203); border: none;"
          class="customer"
          type="info"
          @click="add()"
        >
          新增资料
        </el-button>

        <!-- 批量删除按钮 -->
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

        <!-- 条件重置按钮 -->
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
      <!-- 学习资料列表表格 -->
      <el-table
        row-key="materialId"
        @selection-change="handleSelectionChange"
        :data="tableData"
        style="width: 100%"
        border
        stripe
        :header-cell-style="{ backgroundColor: '#f5f7fa', fontWeight: 'bold' }"
      >
        <!-- 多选列 -->
        <el-table-column type="selection" width="55"></el-table-column>
        <!-- 资料ID列 -->
        <el-table-column
          prop="materialId"
          width="80"
          label="资料ID"
          :sortable="true"
        ></el-table-column>
        <!-- 书籍名称列（替换书籍ID） -->
        <el-table-column
          prop="bookName"
          width="150"
          label="书籍名称"
          :sortable="true"
        ></el-table-column>
        <!-- 资料类型列 -->
        <el-table-column
          prop="materialType"
          width="100"
          label="资料类型"
        ></el-table-column>
        <!-- 资料URL列：改为可点击链接 -->
        <el-table-column prop="materialUrl" label="资料地址" min-width="200">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.materialUrl" placement="top">
              <a
                :href="scope.row.materialUrl"
                target="_blank"
                class="text-ellipsis"
                style="width: 100%; display: inline-block; color: #409eff; text-decoration: underline;"
                @click.prevent="openLink(scope.row.materialUrl)"
              >
                {{ scope.row.materialUrl.split("/").pop() }}
                <!-- 显示文件名而非完整URL -->
              </a>
            </el-tooltip>
          </template>
        </el-table-column>
        <!-- 上传者列 -->
        <el-table-column
          prop="uploader"
          width="120"
          label="上传者"
        ></el-table-column>
        <!-- 上传日期列 -->
        <el-table-column
          :sortable="true"
          prop="uploadDate"
          width="180"
          label="上传日期"
        >
          <template slot-scope="scope">
            {{ formatDate(scope.row.uploadDate) }}
          </template>
        </el-table-column>
        <!-- 审核状态列：中文显示 -->
        <el-table-column prop="auditStatus" width="100" label="审核状态">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.auditStatus)">
              {{
                scope.row.auditStatus === 0
                  ? "未审核"
                  : scope.row.auditStatus === 1
                  ? "审核通过"
                  : "审核拒绝"
              }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 创建时间列 -->
        <el-table-column
          :sortable="true"
          prop="createdTime"
          width="180"
          label="创建时间"
        >
          <template slot-scope="scope">
            {{ formatDate(scope.row.createdTime) }}
          </template>
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              style="color: rgb(43, 121, 203);"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="mini"
              type="text"
              style="color: #a7535a;"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
            <el-button
              size="mini"
              :type="scope.row.auditStatus === 1 ? 'default' : 'primary'"
              @click="handleAudit(scope.row)"
            >
              {{ scope.row.auditStatus === 0 ? "审核" : "重新审核" }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination
        style="margin: 20px 0; float: right;"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pureCurrentPage"
        :page-sizes="[5, 10, 20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
      ></el-pagination>
    </el-row>

    <!-- 新增/编辑资料弹窗（添加圆角，优化表单样式） -->
    <el-dialog
      :show-close="true"
      :visible.sync="dialogMaterialOperation"
      width="600px"
      top="60px"
      :before-close="handleDialogClose"
      class="custom-dialog"
      :modal-append-to-body="false"
      :append-to-body="true"
      :style="{ borderRadius: '8px' }"
    >
      <!-- 弹窗标题 -->
      <div slot="title" class="dialog-title-wrap">
        <h3 class="dialog-title">
          {{ !isOperation ? "新增学习资料" : "编辑学习资料" }}
        </h3>
      </div>

      <!-- 弹窗内容区域（优化表单样式） -->
      <div class="dialog-content">
        <!-- 表单输入区域：2列网格布局，增加间距和对齐 -->
        <div class="form-grid">
          <!-- 书籍名称（替换书籍ID）：搜索选择框 -->
          <div class="form-item">
            <label class="form-label"
              >书籍名称 <span class="required">*</span></label
            >
            <el-select
              v-model="data.bookId"
              placeholder="搜索书籍名称"
              class="form-select"
              :disabled="isOperation"
              clearable
              filterable
              :filter-method="filterBookMethod"
            >
              <el-option
                v-if="bookList.length === 0"
                value=""
                label="加载中..."
              ></el-option>
              <el-option
                v-for="book in filteredBookList"
                :key="book.bookId"
                :label="book.bookName"
                :value="book.bookId"
              ></el-option>
            </el-select>
          </div>

          <!-- 资料类型 -->
          <div class="form-item">
            <label class="form-label"
              >资料类型 <span class="required">*</span></label
            >
            <el-select
              v-model="data.materialType"
              placeholder="请选择资料类型"
              class="form-select"
              clearable
            >
              <el-option label="习题" value="习题"></el-option>
              <el-option label="视频" value="视频"></el-option>
              <el-option label="教案" value="教案"></el-option>
              <el-option label="课件" value="课件"></el-option>
            </el-select>
          </div>

          <!-- 资料文件上传（优化样式） -->
          <div class="form-item full-column">
            <label class="form-label"
              >资料文件 <span class="required">*</span></label
            >
            <!-- 仿照封面上传：优化样式，增加高亮效果 -->
            <el-upload
              class="file-uploader"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleFileUploadSuccess"
              :on-error="handleFileUploadError"
              name="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mp3"
            >
              <!-- 已上传文件预览（显示文件名和图标） -->
              <div v-if="data.materialUrl" class="uploaded-file">
                <i class="el-icon-file-text file-icon"></i>
                <div class="file-info">
                  <p class="file-name">
                    {{ data.materialUrl.split("/").pop() }}
                  </p>
                  <p class="file-tip">
                    点击更换文件（支持PDF/Word/PPT/视频/音频）
                  </p>
                </div>
                <el-button
                  size="mini"
                  type="text"
                  style="color: #a7535a; margin-left: auto;"
                  @click.stop="clearFile"
                >
                  移除
                </el-button>
              </div>
              <!-- 未上传时显示上传图标（优化样式） -->
              <div v-else class="uploader-placeholder">
                <i class="el-icon-cloud-upload uploader-icon"></i>
                <p class="uploader-tip">点击上传资料文件</p>
                <p class="uploader-subtip">
                  支持格式：PDF/Word/PPT/视频/音频，单个文件不超过500MB
                </p>
              </div>
            </el-upload>
            <!-- 隐藏存储URL的输入框 -->
            <input type="hidden" v-model="data.materialUrl" />
          </div>

          <!-- 上传者 -->
          <div class="form-item">
            <label class="form-label"
              >上传者 <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model="data.uploader"
              placeholder="请输入上传者名称"
              maxlength="20"
            />
          </div>

          <!-- 上传日期 -->
          <div class="form-item">
            <label class="form-label"
              >上传日期 <span class="required">*</span></label
            >
            <el-date-picker
              v-model="data.uploadDate"
              type="datetime"
              placeholder="选择上传日期时间"
              class="form-select"
            ></el-date-picker>
          </div>

          <!-- 审核状态（仅编辑显示）：优化回显 -->
          <div class="form-item" v-if="isOperation">
            <label class="form-label"
              >审核状态 <span class="required">*</span></label
            >
            <el-select
              v-model="data.auditStatus"
              placeholder="请选择审核状态"
              class="form-select"
            >
              <el-option label="未审核" :value="0"></el-option>
              <el-option label="审核通过" :value="1"></el-option>
              <el-option label="审核拒绝" :value="2"></el-option>
            </el-select>
          </div>

          <!-- 创建时间（仅编辑显示，禁用） -->
          <div class="form-item" v-if="isOperation">
            <label class="form-label">创建时间</label>
            <input
              class="form-input"
              :value="formatDate(data.createdTime)"
              placeholder="创建时间"
              disabled
            />
          </div>
        </div>
      </div>

      <!-- 弹窗底部按钮区域（优化样式） -->
      <div class="dialog-footer">
        <!-- 新增按钮：仅新增时显示 -->
        <el-button
          size="small"
          v-if="!isOperation"
          class="submit-btn"
          type="primary"
          @click="addOperation"
          :disabled="
            !data.materialUrl ||
              !data.bookId ||
              !data.materialType ||
              !data.uploader
          "
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
        <!-- 取消按钮 -->
        <el-button size="small" class="cancel-btn" @click="handleDialogClose">
          取消
        </el-button>
      </div>
    </el-dialog>

    <!-- 审核弹窗（修复状态回显，添加圆角） -->
    <el-dialog
      :show-close="true"
      :visible.sync="dialogAuditOperation"
      width="400px"
      top="80px"
      class="custom-dialog"
      padding="20px"
      :modal-append-to-body="false"
      :style="{ borderRadius: '8px' }"
    >
      <div slot="title" class="dialog-title-wrap">
        <h3 class="dialog-title">资料审核</h3>
      </div>
      <div class="dialog-content">
        <div class="form-item">
          <label class="form-label"
            >当前状态 <span class="required">*</span></label
          >
          <el-tag :type="getStatusTagType(currentAuditStatus)">
            {{
              currentAuditStatus === 0
                ? "未审核"
                : currentAuditStatus === 1
                ? "审核通过"
                : "审核拒绝"
            }}
          </el-tag>
        </div>
        <div class="form-item" style="margin-top: 16px;">
          <label class="form-label"
            >审核结果 <span class="required">*</span></label
          >
          <el-select
            v-model="auditResult"
            placeholder="请选择审核结果"
            class="form-select"
          >
            <el-option label="审核通过" :value="1"></el-option>
            <el-option label="审核拒绝" :value="2"></el-option>
          </el-select>
        </div>
      </div>
      <div class="dialog-footer">
        <el-button
          size="small"
          class="submit-btn"
          type="primary"
          @click="confirmAudit()"
        >
          确认审核
        </el-button>
        <el-button
          size="small"
          class="cancel-btn"
          @click="dialogAuditOperation = false"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      data: {
        materialId: null, // 资料ID（编辑时回显）
        bookId: "", // 书籍ID（关联书籍表）
        bookName: "", // 书籍名称（回显用）
        materialType: "", // 资料类型
        materialUrl: "", // 资料存储URL（后端返回）
        uploader: "", // 上传者
        uploadDate: new Date(), // 上传日期（默认当前时间）
        auditStatus: 0, // 审核状态（默认未审核）
        createdTime: "" // 创建时间（后端生成）
      },
      materialQueryDto: {}, // 资料查询条件DTO（bookId为书籍ID）
      pageSize: 10, // 每页条数
      totalItems: 0, // 总数据条数
      dialogMaterialOperation: false, // 新增/编辑弹窗显示状态
      dialogAuditOperation: false, // 审核弹窗显示状态
      isOperation: false, // 操作类型（false=新增，true=编辑）
      tableData: [], // 表格数据（含bookName）
      searchTime: [], // 上传时间范围
      selectedRows: [], // 选中行数据
      pureCurrentPage: 1, // 当前页码
      auditResult: 1, // 审核结果（默认通过）
      currentAuditId: null, // 当前审核的资料ID
      currentAuditStatus: 0, // 当前审核资料的状态（修复回显用）
      bookList: [], // 原始书籍列表（从接口查询）
      filteredBookList: [], // 过滤后的书籍列表（用于搜索显示）
      uploadUrl: "/api/file/upload", // 适配现有文件上传接口（与封面上传一致）
      bookMap: {} // 书籍ID→名称映射（优化查询）
    };
  },
  watch: {
    dialogMaterialOperation(v1) {
      // 弹窗关闭时清空表单
      if (!v1) {
        setTimeout(() => {
          this.clearFormData();
          this.isOperation = false;
        }, 300);
      }
    },
    // 监听原始书籍列表变化，初始化过滤列表
    bookList(newVal) {
      this.filteredBookList = [...newVal]; // 初始时显示所有书籍
    }
  },
  created() {
    this.fetchBookList(); // 初始化加载书籍列表
    this.fetchFreshData(); // 初始化加载资料列表
  },
  methods: {
    /**
     * 加载书籍列表（修复查询失败问题）
     */
    async fetchBookList() {
      try {
        // 适配书籍接口：传递空查询条件（与后端BookQueryDto兼容）
        const response = await this.$axios.post("/book/query", {
          current: 1,
          size: 100 // 加载前100本书籍（可根据需求调整）
        });
        // 适配接口返回格式：code=200，data为数组
        if (response.data && response.data.code === 200) {
          const bookData = response.data.data || [];
          // 过滤出包含bookId和bookName的有效数据
          this.bookList = bookData.filter(book => book.bookId && book.bookName);
          // 初始化过滤列表（默认显示所有书籍）
          this.filteredBookList = [...this.bookList];
          // 构建书籍ID→名称映射
          this.bookMap = this.bookList.reduce((map, book) => {
            map[book.bookId] = book.bookName;
            return map;
          }, {});
          // 若无数据提示
          if (this.bookList.length === 0) {
            this.$message.warning("暂无书籍数据，请先添加书籍");
          }
        } else {
          this.$message.error(
            "加载书籍列表失败：" + (response.data.msg || "接口返回异常")
          );
        }
      } catch (e) {
        console.error("查询书籍异常：", e);
        this.$message.error("网络异常，加载书籍列表失败");
      }
    },

    /**
     * 自定义书籍搜索过滤方法（忽略大小写、模糊匹配）
     * @param {string} keyword - 搜索关键词
     */
    filterBookMethod(keyword) {
      if (!keyword) {
        // 关键词为空时，显示所有书籍
        this.filteredBookList = [...this.bookList];
        return;
      }
      // 模糊匹配书籍名称（忽略大小写）
      const lowerKeyword = keyword.toLowerCase();
      this.filteredBookList = this.bookList.filter(book =>
        book.bookName.toLowerCase().includes(lowerKeyword)
      );
    },

    /**
     * 日期格式化
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
     * 根据审核状态获取标签类型
     */
    getStatusTagType(status) {
      switch (status) {
        case 0:
          return "warning"; // 未审核-警告色
        case 1:
          return "success"; // 审核通过-成功色
        case 2:
          return "danger"; // 审核拒绝-危险色
        default:
          return "default";
      }
    },

    /**
     * 弹窗关闭处理
     */
    handleDialogClose() {
      this.dialogMaterialOperation = false;
    },

    /**
     * 表格多选事件
     */
    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    /**
     * 批量删除
     */
    async batchDelete() {
      if (!this.selectedRows.length) {
        this.$message.warning("未选中任何数据");
        return;
      }
      const confirmed = await this.$swalConfirm({
        title: "删除确认",
        text: "删除后不可恢复，是否继续？",
        icon: "warning"
      });
      if (confirmed) {
        try {
          const ids = this.selectedRows.map(item => item.materialId);
          const response = await this.$axios.post(
            `/studyMaterial/batchDelete`,
            ids
          );
          if (response.data.code === 200) {
            this.$swal.fire({
              title: "成功",
              text: "批量删除成功",
              icon: "success",
              showConfirmButton: false,
              timer: 1200
            });
            this.fetchFreshData();
          } else {
            this.$message.error("删除失败：" + response.data.msg);
          }
        } catch (e) {
          console.error("批量删除异常：", e);
          this.$message.error("网络异常，删除失败");
        }
      }
    },

    /**
     * 重置查询条件
     */
    resetQueryCondition() {
      this.materialQueryDto = {};
      this.searchTime = [];
      this.pureCurrentPage = 1;
      this.fetchFreshData();
    },

    /**
     * 编辑资料提交（复用update接口）
     */
    async updateOperation() {
      // 表单校验
      if (
        !this.data.bookId ||
        !this.data.materialType ||
        !this.data.materialUrl ||
        !this.data.uploader ||
        this.data.auditStatus === undefined
      ) {
        this.$swal.fire({
          title: "校验失败",
          text: "带*号的字段不能为空",
          icon: "error",
          showConfirmButton: false,
          timer: 1500
        });
        return;
      }
      try {
        const response = await this.$axios.put(
          "/studyMaterial/update",
          this.data
        );
        if (response.data.code === 200) {
          this.$swal.fire({
            title: "成功",
            text: "修改资料成功",
            icon: "success",
            showConfirmButton: false,
            timer: 1200
          });
          this.handleDialogClose();
          this.fetchFreshData();
        } else {
          this.$message.error("修改失败：" + response.data.msg);
        }
      } catch (e) {
        console.error("修改资料异常：", e);
        this.$message.error("网络异常，修改失败");
      }
    },

    /**
     * 新增资料提交
     */
    async addOperation() {
      // 表单校验（必须上传文件）
      if (
        !this.data.bookId ||
        !this.data.materialType ||
        !this.data.materialUrl ||
        !this.data.uploader
      ) {
        this.$swal.fire({
          title: "校验失败",
          text: "带*号的字段不能为空",
          icon: "error",
          showConfirmButton: false,
          timer: 1500
        });
        return;
      }
      try {
        const response = await this.$axios.post(
          "/studyMaterial/save",
          this.data
        );
        if (response.data.code === 200) {
          this.$swal.fire({
            title: "成功",
            text: "新增资料成功",
            icon: "success",
            showConfirmButton: false,
            timer: 1200
          });
          this.handleDialogClose();
          this.fetchFreshData();
        } else {
          this.$message.error("新增失败：" + response.data.msg);
        }
      } catch (e) {
        console.error("新增资料异常：", e);
        this.$message.error("网络异常，新增失败");
      }
    },

    /**
     * 清空表单数据
     */
    clearFormData() {
      this.data = {
        materialId: null,
        bookId: "",
        bookName: "",
        materialType: "",
        materialUrl: "",
        uploader: "",
        uploadDate: new Date(),
        auditStatus: 0,
        createdTime: ""
      };
    },

    /**
     * 清空已上传文件
     */
    clearFile() {
      this.data.materialUrl = "";
    },

    /**
     * 加载资料列表数据（补充书籍名称回显）
     */
    /**
 * 加载资料列表数据（修复日期格式化错误）
 */
    async fetchFreshData() {
      try {
        this.tableData = [];
        // 处理时间范围参数：用原生 JS 格式化日期（yyyy-MM-dd）
        let uploadDateStart = null;
        let uploadDateEnd = null;

        if (this.searchTime && this.searchTime.length === 2) {
          // 原生 JS 日期格式化工具函数
          const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，补0
            const day = String(date.getDate()).padStart(2, '0'); // 日期补0
            return `${year}-${month}-${day}`;
          };

          uploadDateStart = formatDate(this.searchTime[0]); // 开始日期
          uploadDateEnd = formatDate(this.searchTime[1]); // 结束日期
        }

        // 构造查询参数
        const params = {
          ...this.materialQueryDto,
          uploadDateStart,
          uploadDateEnd,
          current: this.pureCurrentPage,
          size: this.pageSize
        };
        const response = await this.$axios.post("/studyMaterial/query", params);
        const resData = response.data;
        // 补充书籍名称（通过bookMap映射）
        this.tableData = (resData.data || []).map(item => ({
          ...item,
          bookName: this.bookMap[item.bookId] || "未知书籍"
        }));
        this.totalItems = resData.total || 0;
      } catch (e) {
        console.error("查询资料异常：", e);
        this.$message.error("网络异常，查询失败");
      }
    },

    /**
     * 显示新增弹窗
     */
    add() {
      this.isOperation = false;
      this.clearFormData();
      this.dialogMaterialOperation = true;
    },

    /**
     * 筛选查询
     */
    handleFilter() {
      this.pureCurrentPage = 1;
      this.fetchFreshData();
    },

    /**
     * 筛选条件清空
     */
    handleFilterClear() {
      this.fetchFreshData();
    },

    /**
     * 每页条数改变
     */
    handleSizeChange(val) {
      this.pageSize = val;
      this.pureCurrentPage = 1;
      this.fetchFreshData();
    },

    /**
     * 页码改变
     */
    handleCurrentChange(val) {
      this.pureCurrentPage = val;
      this.fetchFreshData();
    },

    /**
     * 编辑资料（优化审核状态回显）
     */
    handleEdit(row) {
      this.isOperation = true;
      // 回显数据（重点：同步当前行的审核状态，实现选择框回显）
      this.data = {
        ...row,
        bookName: this.bookMap[row.bookId] || "未知书籍",
        uploadDate: row.uploadDate ? new Date(row.uploadDate) : new Date(),
        auditStatus: row.auditStatus !== undefined ? row.auditStatus : 0 // 确保审核状态正确回显（兼容undefined）
      };
      this.dialogMaterialOperation = true;
    },

    /**
     * 删除单条资料
     */
    handleDelete(row) {
      this.selectedRows = [row];
      this.batchDelete();
    },

    /**
     * 显示审核弹窗（优化审核结果回显）
     */
    handleAudit(row) {
      this.currentAuditId = row.materialId;
      this.currentAuditStatus =
        row.auditStatus !== undefined ? row.auditStatus : 0; // 回显当前状态

      // 核心：根据当前状态自动选中审核结果（精准回显）
      if (this.currentAuditStatus === 1) {
        this.auditResult = 1; // 已通过→选中"审核通过"
      } else if (this.currentAuditStatus === 2) {
        this.auditResult = 2; // 已拒绝→选中"审核拒绝"
      } else {
        this.auditResult = 1; // 未审核/异常→默认"审核通过"
      }

      this.dialogAuditOperation = true;
    },

    /**
     * 确认审核（使用update接口修改审核状态）
     */
    async confirmAudit() {
      if (!this.currentAuditId) {
        this.$message.error("审核ID不能为空");
        return;
      }
      try {
        // 构造修改参数：仅传递materialId和auditStatus（复用update接口）
        const updateData = {
          materialId: this.currentAuditId,
          auditStatus: this.auditResult
        };
        const response = await this.$axios.put(
          "/studyMaterial/update",
          updateData
        );
        if (response.data.code === 200) {
          this.$swal.fire({
            title: "成功",
            text: `审核${this.auditResult === 1 ? "通过" : "拒绝"}成功`,
            icon: "success",
            showConfirmButton: false,
            timer: 1200
          });
          this.dialogAuditOperation = false;
          this.fetchFreshData();
        } else {
          this.$message.error("审核失败：" + response.data.msg);
        }
      } catch (e) {
        console.error("审核异常：", e);
        this.$message.error("网络异常，审核失败");
      }
    },

    /**
     * 资料文件上传成功回调（仿照封面上传，适配现有接口）
     */
    handleFileUploadSuccess(res) {
      if (res.code !== 200) {
        this.$message.error("资料文件上传失败：" + (res.msg || "未知错误"));
        return;
      }
      this.$message.success("资料文件上传成功");
      this.data.materialUrl = res.data; // 存储后端返回的文件URL
    },

    /**
     * 资料文件上传失败回调
     */
    handleFileUploadError(err) {
      console.error("资料文件上传异常：", err);
      this.$message.error("网络异常，资料文件上传失败");
    },

    /**
     * 打开资料链接（新窗口打开）
     */
    openLink(url) {
      window.open(url, "_blank");
    }
  }
};
</script>

<style scoped lang="scss">
/* 全局样式优化 */
.custom-dialog {
  .el-dialog__body {
    padding: 20px;
  }

  // 弹窗头部和底部圆角（覆盖Element UI默认样式）
  .el-dialog__header {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  .el-dialog__footer {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
}

/* 表单网格布局样式（优化间距和对齐） */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 8px ;
}

/* 占满2列 */
.full-column {
  grid-column: span 2;
}

/* 表单项样式优化 */
.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 表单标签样式优化 */
.form-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 必填项红色星号 */
.required {
  color: #f56c6c;
  margin-left: 2px;
}

/* 表单输入框/选择框样式统一（优化长度、对齐内外框） */
.form-input,
.form-select {
  width: 100%; // 自适应网格宽度，不再过长
  height: 36px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box; // 确保padding不撑大宽度，内外框对齐

  &:focus {
    outline: none;
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
}

// 统一Element UI选择框和日期选择器样式（对齐高度和边框）
.el-select.form-select,
.el-date-picker.form-select {
  width: 100% !important;
  height: 36px !important;
  box-sizing: border-box;
}

.el-select.form-select .el-select__wrap {
  height: 36px !important;
}

.el-select.form-select .el-select__input {
  height: 36px !important;
  line-height: 36px !important;
}

.el-date-picker.form-select .el-input__inner {
  height: 36px !important;
  line-height: 36px !important;
  border-radius: 4px !important;
}

/* 资料文件上传样式（优化） */
.file-uploader {
  display: inline-block;
  width: 100%;
}

/* 已上传文件样式 */
.uploaded-file {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px dashed #409eff;
  border-radius: 6px;
  cursor: pointer;
  background-color: #f0f7ff;
  transition: all 0.3s ease;

  &:hover {
    border-color: #2694ff;
    background-color: #e6f4ff;
  }
}

.file-icon {
  font-size: 28px;
  color: #409eff;
  margin-right: 16px;
}

.file-info {
  flex: 1;
}

.file-name {
  margin: 0;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-tip {
  margin: 4px 0 0;
  font-size: 12px;
  color: #666;
}

/* 未上传占位样式 */
.uploader-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #409eff;
    background-color: #f0f7ff;
  }
}

.uploader-icon {
  font-size: 36px;
  color: #409eff;
  margin-bottom: 12px;
}

.uploader-tip {
  margin: 0 0 8px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.uploader-subtip {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

/* 弹窗按钮区域样式优化 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.submit-btn {
  background-color: #409eff !important;
  border-color: #409eff !important;
  color: #fff !important;

  &:hover {
    background-color: #2694ff !important;
    border-color: #2694ff !important;
  }
}

.cancel-btn {
  background-color: #f5f7fa !important;
  border-color: #dcdfe6 !important;
  color: #666 !important;

  &:hover {
    background-color: #e6e9ed !important;
    border-color: #c0c4cc !important;
  }
}

/* 链接样式优化 */
a.text-ellipsis {
  &:hover {
    color: #2694ff !important;
    text-decoration: none !important;
  }
}

/* 表格样式优化 */
.el-table {
  margin-bottom: 16px;
}

.el-table th {
  text-align: center !important;
}

.el-table td {
  text-align: center !important;
}

/* 修复搜索选择框输入框样式 */
.el-select__input {
  height: 36px !important;
  line-height: 36px !important;
}
/* 解决下拉选择框双层边框问题 */
.form-select {
  border: none !important; /* 去掉外层form-select的边框 */
  box-shadow: none !important;
}

/* 只保留el-select自身的单层边框 */
.el-select.form-select .el-select__wrap {
  border: 1px solid #dcdfe6 !important;
  border-radius: 4px !important;
  box-sizing: border-box;
}

/* 聚焦时的样式（可选，保持单层高亮） */
.el-select.form-select .el-select__wrap:focus-within {
  border-color: #409eff !important;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
}
</style>
