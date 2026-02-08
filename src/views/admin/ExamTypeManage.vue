<template>
  <!-- 考试类型管理页面根容器：白色背景，上下内边距20px，圆角5px -->
  <el-row
    style="background-color: #FFFFFF; padding: 20px 0; border-radius: 5px;"
  >
    <!-- 筛选条件区域：内边距10px，左右外边距10px -->
    <el-row style="padding: 10px; margin: 0 10px;">
      <el-row>
        <!-- 考试类型名称筛选标签 -->
        <span class="top-bar">考试类型名称</span>
        <!-- 考试类型名称输入框：双向绑定查询条件，支持清空 -->
        <el-input
          size="small"
          style="width: 150px; margin-right: 10px;"
          v-model="examTypeDto.examName"
          placeholder="请输入考试类型名称"
          clearable
          @clear="handleFilterClear"
        ></el-input>

        <!-- 考试科目筛选标签 -->
        <span class="top-bar">考试科目</span>
        <!-- 考试科目下拉选择器：可根据实际业务扩展选项 -->
        <!-- 弹窗内的考试科目：自定义搜索+远程联想 -->
        <el-input
          size="small"
          style="width: 150px; margin-right: 10px;"
          v-model="examTypeDto.examSubject"
          placeholder="请输入考试科目名称"
          clearable
        ></el-input>

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

        <!-- 新增考试类型按钮：点击显示新增弹窗 -->
        <el-button
          size="small"
          style="background-color: rgb(235, 237, 245); color: rgb(43, 121, 203); border: none;"
          class="customer"
          type="info"
          @click="add()"
        >
          新增考试类型
        </el-button>

        <!-- 批量删除按钮：根据选中行数量动态切换样式 -->
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
      <!-- 考试类型列表表格：支持多选，绑定表格数据 -->
      <el-table
        row-key="examTypeId"
        @selection-change="handleSelectionChange"
        :data="tableData"
        style="width: 100%"
      >
        <!-- 多选列：宽度55px -->
        <el-table-column type="selection" width="55"></el-table-column>

        <!-- 考试类型名称列：绑定examName字段，宽度148px -->
        <el-table-column
          prop="examName"
          width="148"
          label="考试类型名称"
        ></el-table-column>
        <!-- 考试科目列：绑定examSubject字段，宽度148px -->
        <el-table-column
          prop="examSubject"
          width="148"
          label="考试科目"
        ></el-table-column>
        <!-- 考试周期列：绑定examCycle字段，宽度148px -->
        <el-table-column
          prop="examCycle"
          width="148"
          label="考试周期"
        ></el-table-column>
        <!-- 考试描述列：绑定examDesc字段，宽度228px -->
        <el-table-column
          prop="examDesc"
          width="228"
          label="考试描述"
        ></el-table-column>

        <!-- 操作列：包含编辑、删除按钮 -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <span class="text-button" @click="handleEdit(scope.row)">编辑</span>
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
        :current-page.sync="pureCurrentPage"
        :page-sizes="[5, 7, 10]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
      ></el-pagination>
    </el-row>

    <!-- 新增/编辑考试类型弹窗 -->
    <el-dialog
      :show-close="false"
      :visible.sync="dialogExamTypeOperation"
      width="50%"
      top="40px"
      :before-close="handleDialogClose"
      class="custom-dialog"
    >
      <!-- 弹窗标题 -->
      <div slot="title" class="dialog-title-wrap">
        <p class="dialog-title">
          {{ !isOperation ? "新增考试类型" : "编辑考试类型" }}
        </p>
      </div>

      <!-- 弹窗内容区域 -->
      <div class="dialog-content">
        <!-- 表单输入区域：2列网格布局 -->
        <div class="form-grid">
          <!-- 考试类型名称 -->
          <div class="form-item">
            <label class="form-label"
              >考试类型名称 <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model="data.examName"
              placeholder="请输入考试类型名称（如：考研、公务员考试、四六级）"
              :disabled="isOperation && !canEditBaseInfo"
            />
          </div>

          <!-- 考试科目 -->
          <div class="form-item">
            <label class="form-label"
              >考试科目 <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model="data.examSubject"
              placeholder="请输入考试科目"
              :disabled="isOperation && !canEditBaseInfo"
            />
          </div>

          <!-- 考试周期 -->
          <div class="form-item">
            <label class="form-label"
              >考试周期 <span class="required">*</span></label
            >
            <el-select
              v-model="data.examCycle"
              placeholder="请选择考试周期"
              class="form-select"
            >
              <el-option label="每年一次" value="每年一次"></el-option>
              <el-option label="每半年一次" value="每半年一次"></el-option>
              <el-option label="每季度一次" value="每季度一次"></el-option>
              <el-option label="每月一次" value="每月一次"></el-option>
              <el-option label="不定期" value="不定期"></el-option>
            </el-select>
          </div>

          <!-- 考试状态（仅编辑显示） -->
          <div class="form-item" v-if="isOperation">
            <label class="form-label"
              >考试类型状态 <span class="required">*</span></label
            >
            <el-select
              v-model="data.status"
              placeholder="请选择考试类型状态"
              class="form-select"
            >
              <el-option label="启用" :value="1"></el-option>
              <el-option label="禁用" :value="2"></el-option>
            </el-select>
          </div>

          <!-- 考试描述 -->
          <div class="form-item" style="grid-column: 1 / -1;">
            <label class="form-label">考试描述</label>
            <textarea
              class="form-input"
              v-model="data.examDesc"
              placeholder="请输入考试类型描述（可选）"
              rows="4"
              style="height: auto; resize: none;"
            ></textarea>
          </div>

          <!-- 创建时间（仅编辑显示） -->
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

      <!-- 弹窗底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button
          size="small"
          v-if="!isOperation"
          class="submit-btn"
          type="primary"
          @click="addOperation"
        >
          确认新增
        </el-button>
        <el-button
          size="small"
          v-else
          class="submit-btn"
          type="primary"
          @click="updateOperation"
        >
          保存修改
        </el-button>
        <el-button size="small" class="cancel-btn" @click="handleDialogClose">
          取消
        </el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
export default {
  name: "ExamTypeManager",
  data() {
    return {
      data: {
        examTypeId: "", // 考试类型ID
        examName: "", // 考试类型名称
        examSubject: "", // 考试科目
        examCycle: "", // 考试周期
        examDesc: "", // 考试描述
        status: 1, // 考试类型状态（1=启用，2=禁用）
        createdTime: "" // 创建时间
      },
      examTypeDto: {}, // 考试类型查询条件DTO
      pageSize: 7, // 每页条数
      totalItems: 0, // 总数据条数
      dialogExamTypeOperation: false, // 新增/编辑考试类型弹窗显示状态
      isOperation: false, // 操作类型标识（false=新增，true=编辑）
      tableData: [], // 考试类型列表表格数据
      selectedRows: [], // 表格选中行数据
      pureCurrentPage: 1, // 纯净的页码
      canEditBaseInfo: true // 控制是否允许修改基础信息
    };
  },
  watch: {
    dialogExamTypeOperation(v1, v2) {
      // 弹窗从显示变为隐藏时，清空表单
      if (!v1 && v2) {
        setTimeout(() => {
          this.clearFormData();
          if (this.isOperation) {
            this.isOperation = false;
          }
        }, 300);
      }
    }
  },
  created() {
    this.fetchFreshData();
  },
  methods: {
    /**
     * 日期格式化方法
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
     * 弹窗关闭统一处理方法
     */
    handleDialogClose() {
      this.dialogExamTypeOperation = false;
    },

    /**
     * 表格多选事件
     */
    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    /**
     * 批量删除考试类型
     */
    async batchDelete() {
      if (!this.selectedRows.length) {
        this.$message(`未选中任何考试类型数据`);
        return;
      }

      const confirmed = await this.$swalConfirm({
        title: "删除考试类型数据",
        text: `删除后不可恢复，是否继续？`,
        icon: "warning"
      });
      if (confirmed) {
        try {
          let ids = this.selectedRows.map(entity => entity.examTypeId);
          const response = await this.$axios.post(`/examType/batchDelete`, ids);
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
          console.error(`考试类型删除异常：`, e);
        }
      }
    },

    /**
     * 重置查询条件
     */
    resetQueryCondition() {
      this.examTypeDto = {};
      this.fetchFreshData();
    },

    /**
     * 编辑考试类型：提交修改
     */
    async updateOperation() {
      if (!this.data.examName) {
        this.$swal.fire({
          title: "校验失败",
          text: "考试类型名称不能为空",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
          position: "fixed",
          appendTo: document.body,
          zIndex: 9999
        });
        return;
      }
      if (!this.data.examSubject) {
        this.$swal.fire({
          title: "校验失败",
          text: "请选择考试科目",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
          position: "fixed",
          appendTo: document.body,
          zIndex: 9999
        });
        return;
      }
      if (!this.data.examCycle) {
        this.$swal.fire({
          title: "校验失败",
          text: "请选择考试周期",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
          position: "fixed",
          appendTo: document.body,
          zIndex: 9999
        });
        return;
      }

      try {
        const response = await this.$axios.put("/examType/update", this.data);
        this.$swal.fire({
          title: "考试类型信息修改",
          text: response.data.msg,
          icon: response.data.code === 200 ? "success" : "error",
          showConfirmButton: false,
          timer: 1000
        });
        if (response.data.code === 200) {
          this.handleDialogClose();
          this.fetchFreshData();
        }
      } catch (error) {
        console.error("提交表单时出错:", error);
        this.$message.error("提交失败，请稍后再试！");
      }
    },

    /**
     * 新增考试类型：提交新增
     */
    async addOperation() {
      if (!this.data.examName) {
        this.$swal.fire({
          title: "校验失败",
          text: "考试类型名称不能为空",
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
      if (!this.data.examSubject) {
        this.$swal.fire({
          title: "校验失败",
          text: "请选择考试科目",
          icon: "error",
          showConfirmButton: false,
          timer: 1500
        });
        const swalContainer = document.querySelector(".swal2-container");
        if (swalContainer) {
          swalContainer.style.zIndex = "2147483647";
        }
        return;
      }
      if (!this.data.examCycle) {
        this.$swal.fire({
          title: "校验失败",
          text: "请选择考试周期",
          icon: "error",
          showConfirmButton: false,
          timer: 1500
        });
        const swalContainer = document.querySelector(".swal2-container");
        if (swalContainer) {
          swalContainer.style.zIndex = "2147483647";
        }
        return;
      }

      try {
        const addData = {
          ...this.data,
          status: 1, // 新增考试类型默认启用
          createdTime: new Date().toISOString()
        };
        const response = await this.$axios.post("/examType/save", addData);
        this.$message[response.data.code === 200 ? "success" : "error"](
          response.data.msg
        );
        if (response.data.code === 200) {
          this.handleDialogClose();
          this.fetchFreshData();
        }
      } catch (error) {
        console.error("提交表单时出错:", error);
        this.$message.error("提交失败，请稍后再试！");
      }
    },

    /**
     * 清空表单数据
     */
    clearFormData() {
      this.data = {
        examTypeId: "",
        examName: "",
        examSubject: "",
        examCycle: "",
        examDesc: "",
        status: 1,
        createdTime: ""
      };
    },

    /**
     * 加载考试类型列表数据
     */
    async fetchFreshData() {
      try {
        this.tableData = [];
        const params = {
          examName: this.examTypeDto.examName,
          examSubject: this.examTypeDto.examSubject,
          current: this.pureCurrentPage,
          size: this.pageSize
        };
        console.log("当前页码：", this.pureCurrentPage);
        console.log("每页条数：", this.pageSize);
        const response = await this.$axios.post("/examType/query", params);
        const { data } = response;
        this.tableData = data.data || [];
        this.totalItems = data.total || 0;
      } catch (error) {
        console.error("查询考试类型信息异常:", error);
      }
    },

    /**
     * 显示新增考试类型弹窗
     */
    add() {
      this.isOperation = false;
      this.clearFormData();
      this.dialogExamTypeOperation = true;
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
      this.examTypeDto.examName = "";
      this.handleFilter();
    },

    /**
     * 每页条数改变事件
     */
    handleSizeChange(val) {
      this.pageSize = val;
      this.pureCurrentPage = 1;
      this.fetchFreshData();
    },

    /**
     * 页码改变事件
     */
    handleCurrentChange(val) {
      console.log("页码切换触发：", val);
      this.pureCurrentPage = val;
      console.log("pureCurrentPage更新后：", this.pureCurrentPage);
      this.fetchFreshData();
    },

    /**
     * 编辑考试类型
     */
    handleEdit(row) {
      this.isOperation = true;
      // 复制行数据到表单
      this.data = { ...row };
      this.dialogExamTypeOperation = true;
    },

    /**
     * 删除单条考试类型
     */
    handleDelete(row) {
      this.selectedRows = [row];
      this.batchDelete();
    }
  }
};
</script>

<style scoped lang="scss">
/* 标签提示样式 */
.tag-tip {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 5px;
  background-color: rgb(245, 245, 245);
  color: rgb(104, 118, 130);
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
    text-decoration: underline;
  }
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
  box-sizing: border-box;

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

/* 弹窗圆角样式 */
.custom-dialog {
  border-radius: 12px !important;
}

::v-deep .el-dialog__body {
  padding: 20px !important;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 覆盖Element UI下拉框的默认样式 */
::v-deep .el-select .el-input__wrapper {
  height: 36px !important;
  padding: 0 !important;
  border: 1px solid #e6e6e6 !important;
  border-radius: 6px !important;
}

::v-deep .el-select .el-input__inner {
  height: 34px !important;
  line-height: 34px !important;
  padding: 0 !important;
  border: none !important;
  font-size: 14px !important;
}

::v-deep .el-select .el-input__suffix {
  height: 34px !important;
  line-height: 34px !important;
}

/* 解决SweetAlert2层级问题 */
:global(.swal2-container.swal2-center.swal2-backdrop-show) {
  z-index: 2147483647 !important;
  position: fixed !important;
  inset: 0 !important;
  overflow: visible !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 解除body的overflow限制 */
:global(body.el-popup-parent--hidden.swal2-shown) {
  overflow: visible !important;
}

/* 解除#app的隐藏标记影响 */
:global(#app[aria-hidden="true"]) {
  visibility: visible !important;
  pointer-events: auto !important;
}
</style>
