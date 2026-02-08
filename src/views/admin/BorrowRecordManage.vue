<template>
  <!-- 借阅记录管理页面根容器 -->
  <div class="borrow-record-container">
    <!-- 筛选条件区域 -->
    <el-row style="padding: 10px; margin: 0 10px;">
      <!-- 外层 flex 容器：确保所有筛选组件横向排列 -->
      <div
        style="display: flex; align-items: center; flex-wrap: wrap; gap: 12px;"
      >
        <!-- 用户名筛选 -->
        <div style="display: flex; align-items: center;">
          <span class="top-bar">用户名</span>
          <el-input
            size="small"
            style="width: 100px; margin-left: 8px;"
            v-model="borrowQueryDto.userName"
            placeholder="输入用户名"
            clearable
            @clear="handleFilterClear"
          ></el-input>
        </div>

        <!-- 图书名筛选 -->
        <div style="display: flex; align-items: center;">
          <span class="top-bar">图书名</span>
          <el-input
            size="small"
            style="width: 100px; margin-left: 8px;"
            v-model="borrowQueryDto.bookName"
            placeholder="输入图书名"
            clearable
            @clear="handleFilterClear"
          ></el-input>
        </div>

        <!-- 借阅状态筛选 -->
        <div style="display: flex; align-items: center;">
          <span class="top-bar">借阅状态</span>
          <el-select
            size="small"
            style="width: 140px; margin-left: 8px;"
            v-model="borrowQueryDto.borrowStatus"
            placeholder="选择状态"
            clearable
          >
            <el-option label="未归还" :value="1"></el-option>
            <el-option label="已归还" :value="2"></el-option>
            <el-option label="逾期" :value="3"></el-option>
          </el-select>
        </div>

        <!-- 借阅日期范围：关键调整 - 外层包裹div，确保和其他组件对齐 -->
        <div style="display: flex; align-items: center;">
          <span class="top-bar">借阅日期</span>
          <el-date-picker
            size="small"
            style="width: 220px; margin-left: 8px;"
            v-model="borrowDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="起始时间"
            end-placeholder="结束时间"
          ></el-date-picker>
        </div>

        <!-- 功能按钮组：用flex包裹，保持按钮间距一致 -->
        <div
          style="display: flex; align-items: center; gap: 8px; margin-left: auto;"
        >
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

          <!-- 新增借阅按钮 -->
          <el-button
            size="small"
            style="background-color: rgb(235, 237, 245); color: rgb(43, 121, 203); border: none;"
            class="customer"
            type="info"
            @click="addBorrow()"
          >
            新增借阅
          </el-button>

          <!-- 批量删除按钮 -->
          <el-button
            size="small"
            class="customer"
            :style="{
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
        </div>
      </div>
    </el-row>

    <!-- 表格及分页区域 -->
    <el-row style="margin: 10px 20px;">
      <!-- 借阅记录表格 -->
      <el-table
        row-key="borrowId"
        @selection-change="handleSelectionChange"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column
          prop="userName"
          width="120"
          label="用户名"
        ></el-table-column>
        <el-table-column
          prop="bookName"
          width="180"
          label="图书名"
        ></el-table-column>
        <el-table-column
          prop="borrowDate"
          width="180"
          label="借阅日期"
          :sortable="true"
        >
          <template slot-scope="scope">{{
            formatDate(scope.row.borrowDate)
          }}</template>
        </el-table-column>
        <el-table-column
          prop="dueDate"
          width="180"
          label="应还日期"
          :sortable="true"
        >
          <template slot-scope="scope">{{
            formatDate(scope.row.dueDate)
          }}</template>
        </el-table-column>
        <el-table-column
          prop="returnDate"
          width="180"
          label="归还日期"
          :sortable="true"
        >
          <template slot-scope="scope">{{
            scope.row.returnDate ? formatDate(scope.row.returnDate) : "未归还"
          }}</template>
        </el-table-column>
        <el-table-column prop="borrowStatusDesc" width="100" label="借阅状态">
          <template slot-scope="scope">
            <el-tag
              :type="
                scope.row.borrowStatusDesc === '未归还'
                  ? 'warning'
                  : scope.row.borrowStatusDesc === '已归还'
                  ? 'success'
                  : 'danger'
              "
            >
              {{ scope.row.borrowStatusDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="renewCount"
          width="80"
          label="续借次数"
        ></el-table-column>
        <el-table-column
          prop="operator"
          width="120"
          label="操作人"
        ></el-table-column>
        <el-table-column
          prop="createdTime"
          width="180"
          label="创建时间"
          :sortable="true"
        >
          <template slot-scope="scope">{{
            formatDate(scope.row.createdTime)
          }}</template>
        </el-table-column>
        <!-- 操作列：flex布局让按钮水平对齐 -->
        <el-table-column label="操作" width="210">
          <template slot-scope="scope">
            <div style="display: flex; gap: 8px; align-items: center;">
              <!-- 续借按钮（仅未归还可续借） -->
              <el-button
                size="mini"
                type="primary"
                @click="renewBorrow(scope.row)"
                :disabled="scope.row.borrowStatusDesc === '已归还'"
                style="width: 60px; padding: 6px 0;"
              >
                续借
              </el-button>
              <!-- 还书按钮（仅未归还可还书） -->
              <el-button
                size="mini"
                type="success"
                @click="returnBook(scope.row)"
                :disabled="scope.row.borrowStatusDesc === '已归还'"
                style="width: 60px; padding: 6px 0;"
              >
                还书
              </el-button>
              <!-- 删除按钮 -->
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.row)"
                style="width: 60px; padding: 6px 0;"
              >
                删除
              </el-button>
            </div>
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

    <!-- 新增借阅弹窗 -->
    <el-dialog
      :show-close="false"
      :visible.sync="dialogBorrowOperation"
      width="50%"
      top="40px"
      :before-close="handleDialogClose"
      class="custom-dialog"
    >
      <div slot="title" class="dialog-title-wrap">
        <p class="dialog-title">
          {{ isOperation ? "编辑借阅记录" : "新增借阅" }}
        </p>
      </div>
      <div class="dialog-content">
        <div class="form-grid">
          <!-- 用户ID -->
          <div class="form-item">
            <label class="form-label"
              >用户ID <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model="data.userId"
              placeholder="请输入用户ID"
              :disabled="isOperation"
            />
          </div>
          <!-- 图书ID -->
          <div class="form-item">
            <label class="form-label"
              >图书ID <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model="data.bookId"
              placeholder="请输入图书ID"
              :disabled="isOperation"
            />
          </div>
          <!-- 借阅日期 -->
          <div class="form-item">
            <label class="form-label"
              >借阅日期 <span class="required">*</span></label
            >
            <el-date-picker
              v-model="data.borrowDate"
              type="datetime"
              placeholder="选择借阅日期"
              class="form-input"
              :disabled="isOperation"
            ></el-date-picker>
          </div>
          <!-- 应还日期 -->
          <div class="form-item">
            <label class="form-label"
              >应还日期 <span class="required">*</span></label
            >
            <el-date-picker
              v-model="data.dueDate"
              type="datetime"
              placeholder="选择应还日期"
              class="form-input"
            ></el-date-picker>
          </div>
          <!-- 实际归还日期（仅编辑时显示） -->
          <div class="form-item" v-if="isOperation">
            <label class="form-label">归还日期</label>
            <el-date-picker
              v-model="data.returnDate"
              type="datetime"
              placeholder="选择归还日期（未归还可不填）"
              class="form-input"
            ></el-date-picker>
          </div>
          <!-- 借阅状态（仅编辑时显示） -->
          <div class="form-item" v-if="isOperation">
            <label class="form-label"
              >借阅状态 <span class="required">*</span></label
            >
            <el-select
              v-model="data.borrowStatus"
              placeholder="选择借阅状态"
              class="form-select"
            >
              <el-option label="未归还" :value="1"></el-option>
              <el-option label="已归还" :value="2"></el-option>
              <el-option label="逾期" :value="3"></el-option>
            </el-select>
          </div>
          <!-- 续借次数 -->
          <div class="form-item">
            <label class="form-label">续借次数</label>
            <input
              class="form-input"
              v-model="data.renewCount"
              type="number"
              min="0"
              placeholder="默认为0"
            />
          </div>
          <!-- 操作人 -->
          <div class="form-item">
            <label class="form-label"
              >操作人 <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model="data.operator"
              placeholder="请输入操作人"
            />
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          size="small"
          class="submit-btn"
          type="primary"
          @click="isOperation ? updateOperation() : addOperation()"
        >
          {{ isOperation ? "保存修改" : "确认新增" }}
        </el-button>
        <el-button size="small" class="cancel-btn" @click="handleDialogClose"
          >取消</el-button
        >
      </span>
    </el-dialog>

    <!-- 续借弹窗 -->
    <el-dialog
      :show-close="false"
      :visible.sync="dialogRenewOperation"
      width="40%"
      top="40px"
      class="custom-dialog"
    >
      <div slot="title" class="dialog-title-wrap">
        <p class="dialog-title">续借操作</p>
      </div>
      <div class="dialog-content">
        <div class="form-item">
          <label class="form-label">当前应还日期</label>
          <input
            class="form-input"
            :value="formatDate(renewData.dueDate)"
            disabled
          />
        </div>
        <div class="form-item">
          <label class="form-label"
            >新应还日期 <span class="required">*</span></label
          >
          <el-date-picker
            v-model="renewData.newDueDate"
            type="datetime"
            placeholder="选择新的应还日期"
            class="form-input"
          ></el-date-picker>
        </div>
        <div class="form-item">
          <label class="form-label"
            >操作人 <span class="required">*</span></label
          >
          <input
            class="form-input"
            v-model="renewData.operator"
            placeholder="请输入操作人"
          />
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          size="small"
          class="submit-btn"
          type="primary"
          @click="confirmRenew()"
          >确认续借</el-button
        >
        <el-button
          size="small"
          class="cancel-btn"
          @click="dialogRenewOperation = false"
          >取消</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 表格数据
      tableData: [],
      totalItems: 0,
      pageSize: 10,
      pureCurrentPage: 1,
      selectedRows: [],

      // 筛选条件
      borrowQueryDto: {
        userName: "",
        bookName: "",
        borrowStatus: null,
        startBorrowDate: "",
        endBorrowDate: ""
      },
      borrowDateRange: [],

      // 弹窗相关
      dialogBorrowOperation: false,
      dialogRenewOperation: false,
      isOperation: false, // false=新增，true=编辑

      // 表单数据
      data: {
        borrowId: "",
        userId: "",
        bookId: "",
        borrowDate: new Date(),
        dueDate: "",
        returnDate: "",
        borrowStatus: 1, // 默认未归还
        renewCount: 0,
        operator: ""
      },

      // 续借数据
      renewData: {
        borrowId: "",
        dueDate: "",
        newDueDate: "",
        operator: ""
      }
    };
  },
  watch: {
    dialogBorrowOperation(v1) {
      // 弹窗关闭时清空表单
      if (!v1) {
        setTimeout(() => {
          this.clearFormData();
          this.isOperation = false;
        }, 300);
      }
    }
  },
  created() {
    this.fetchFreshData();
  },
  methods: {
    /** 日期格式化 */
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

    /** 加载借阅记录数据 */
    async fetchFreshData() {
      try {
        this.tableData = [];
        // 处理日期范围
        if (this.borrowDateRange && this.borrowDateRange.length === 2) {
          this.borrowQueryDto.startBorrowDate = `${
            this.borrowDateRange[0].toISOString().split("T")[0]
          }T00:00:00`;
          this.borrowQueryDto.endBorrowDate = `${
            this.borrowDateRange[1].toISOString().split("T")[0]
          }T23:59:59`;
        } else {
          this.borrowQueryDto.startBorrowDate = "";
          this.borrowQueryDto.endBorrowDate = "";
        }

        const params = {
          ...this.borrowQueryDto,
          current: this.pureCurrentPage,
          size: this.pageSize
        };

        const response = await this.$axios.post("/borrowRecord/query", params);
        const res = response.data;
        if (res.code === 200) {
          this.tableData = res.data;
          this.totalItems = res.total;
        } else {
          this.$message.error("查询借阅记录失败");
        }
      } catch (error) {
        console.error("查询借阅记录异常:", error);
        this.$message.error("网络异常，查询失败");
      }
    },

    /** 筛选查询 */
    handleFilter() {
      this.pureCurrentPage = 1;
      this.fetchFreshData();
    },

    /** 清空筛选条件 */
    handleFilterClear() {
      this.borrowQueryDto = {
        userName: "",
        bookName: "",
        borrowStatus: null,
        startBorrowDate: "",
        endBorrowDate: ""
      };
      this.borrowDateRange = [];
      this.handleFilter();
    },

    /** 重置查询条件 */
    resetQueryCondition() {
      this.borrowQueryDto = {
        userName: "",
        bookName: "",
        borrowStatus: null,
        startBorrowDate: "",
        endBorrowDate: ""
      };
      this.borrowDateRange = [];
      this.pureCurrentPage = 1;
      this.fetchFreshData();
    },

    /** 表格选中事件 */
    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    /** 每页条数改变 */
    handleSizeChange(val) {
      this.pageSize = val;
      this.pureCurrentPage = 1;
      this.fetchFreshData();
    },

    /** 页码改变 */
    handleCurrentChange(val) {
      this.pureCurrentPage = val;
      this.fetchFreshData();
    },

    /** 新增借阅弹窗 */
    addBorrow() {
      this.isOperation = false;
      this.clearFormData();
      this.data.borrowDate = new Date();
      this.data.renewCount = 0;
      this.data.borrowStatus = 1;
      this.dialogBorrowOperation = true;
    },

    /** 编辑借阅记录 */
    handleEdit(row) {
      this.isOperation = true;
      this.data = { ...row };
      // 转换日期格式
      this.data.borrowDate = row.borrowDate
        ? new Date(row.borrowDate)
        : new Date();
      this.data.dueDate = row.dueDate ? new Date(row.dueDate) : "";
      this.data.returnDate = row.returnDate ? new Date(row.returnDate) : "";
      this.dialogBorrowOperation = true;
    },

    /** 关闭弹窗 */
    handleDialogClose() {
      this.dialogBorrowOperation = false;
    },

    /** 清空表单 */
    clearFormData() {
      this.data = {
        borrowId: "",
        userId: "",
        bookId: "",
        borrowDate: new Date(),
        dueDate: "",
        returnDate: "",
        borrowStatus: 1,
        renewCount: 0,
        operator: ""
      };
    },

    /** 新增借阅提交 */
    async addOperation() {
      if (
        !this.data.userId ||
        !this.data.bookId ||
        !this.data.dueDate ||
        !this.data.operator
      ) {
        this.$message.error("用户ID、图书ID、应还日期、操作人不能为空");
        return;
      }

      try {
        const borrowRecord = {
          userId: this.data.userId,
          bookId: this.data.bookId,
          borrowDate: this.data.borrowDate,
          dueDate: this.data.dueDate,
          borrowStatus: 1,
          renewCount: this.data.renewCount || 0,
          operator: this.data.operator,
          createdTime: new Date()
        };

        const response = await this.$axios.post(
          "/borrowRecord/save",
          borrowRecord
        );
        const res = response.data;
        if (res.code === 200) {
          this.$message.success("新增借阅记录成功");
          this.handleDialogClose();
          this.fetchFreshData();
        } else {
          this.$message.error(`新增失败：${res.msg}`);
        }
      } catch (error) {
        console.error("新增借阅记录异常:", error);
        this.$message.error("网络异常，新增失败");
      }
    },

    /** 更新借阅记录 */
    async updateOperation() {
      if (!this.data.borrowId || !this.data.operator) {
        this.$message.error("记录ID、操作人不能为空");
        return;
      }

      try {
        const borrowRecord = {
          borrowId: this.data.borrowId,
          dueDate: this.data.dueDate,
          returnDate: this.data.returnDate,
          borrowStatus: this.data.borrowStatus,
          renewCount: this.data.renewCount || 0,
          operator: this.data.operator
        };

        const response = await this.$axios.post(
          "/borrowRecord/update",
          borrowRecord
        );
        const res = response.data;
        if (res.code === 200) {
          this.$message.success("修改借阅记录成功");
          this.handleDialogClose();
          this.fetchFreshData();
        } else {
          this.$message.error(`修改失败：${res.msg}`);
        }
      } catch (error) {
        console.error("修改借阅记录异常:", error);
        this.$message.error("网络异常，修改失败");
      }
    },

    /** 还书操作 */
    async returnBook(row) {
      try {
        const borrowRecord = {
          borrowId: row.borrowId,
          returnDate: new Date(),
          borrowStatus: 0,
          operator: this.$store.state.userInfo.userName || "admin" // 从全局获取当前操作人
        };

        const response = await this.$axios.post(
          "/borrowRecord/update",
          borrowRecord
        );
        const res = response.data;
        if (res.code === 200) {
          this.$message.success("还书成功");
          this.fetchFreshData();
        } else {
          this.$message.error(`还书失败：${res.msg}`);
        }
      } catch (error) {
        console.error("还书操作异常:", error);
        this.$message.error("网络异常，还书失败");
      }
    },

    /** 续借操作 */
    renewBorrow(row) {
      this.renewData = {
        borrowId: row.borrowId,
        dueDate: row.dueDate,
        newDueDate: "",
        operator: this.$store.state.userInfo.userName || ""
      };
      this.dialogRenewOperation = true;
    },

    /** 确认续借 */
    async confirmRenew() {
      if (!this.renewData.newDueDate || !this.renewData.operator) {
        this.$message.error("新应还日期、操作人不能为空");
        return;
      }

      // 校验新日期必须晚于原日期
      if (
        new Date(this.renewData.newDueDate) <= new Date(this.renewData.dueDate)
      ) {
        this.$message.error("新应还日期必须晚于原应还日期");
        return;
      }

      try {
        const borrowRecord = {
          borrowId: this.renewData.borrowId,
          dueDate: this.renewData.newDueDate,
          renewCount:
            this.tableData.find(
              item => item.borrowId === this.renewData.borrowId
            ).renewCount + 1,
          operator: this.renewData.operator
        };

        const response = await this.$axios.post(
          "/borrowRecord/update",
          borrowRecord
        );
        const res = response.data;
        if (res.code === 200) {
          this.$message.success("续借成功");
          this.dialogRenewOperation = false;
          this.fetchFreshData();
        } else {
          this.$message.error(`续借失败：${res.msg}`);
        }
      } catch (error) {
        console.error("续借操作异常:", error);
        this.$message.error("网络异常，续借失败");
      }
    },

    /** 单条删除 */
    handleDelete(row) {
      this.selectedRows = [row];
      this.batchDelete();
    },

    /** 批量删除 */
    async batchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning("请选择要删除的记录");
        return;
      }

      try {
        const borrowIds = this.selectedRows.map(item => item.borrowId);
        const response = await this.$axios.post(
          "/borrowRecord/batchDelete",
          borrowIds
        );
        const res = response.data;
        if (res.code === 200) {
          this.$message.success("删除成功");
          this.selectedRows = [];
          this.fetchFreshData();
        } else {
          this.$message.error(`删除失败：${res.msg}`);
        }
      } catch (error) {
        console.error("删除借阅记录异常:", error);
        this.$message.error("网络异常，删除失败");
      }
    }
  }
};
</script>

<style scoped lang="scss">
/* 复用原样式，保持风格一致 */
.top-bar {
  display: inline-block;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  /* 防止文字换行 */
}

.customer {
  border-radius: 4px !important;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
}

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

.dialog-content {
  padding: 0 30px 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

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
  transition: border-color 0.3s ease;
  height: 36px;
  box-sizing: border-box;

  &:focus {
    border-color: #409eff;
  }

  &:disabled {
    background-color: #fafafa;
    color: #999;
  }
}

.form-select {
  width: 100%;
  height: 36px;
  border-radius: 6px;
}

.submit-btn {
  background-color: #409eff !important;
  color: #fff !important;
  border: none !important;
  border-radius: 6px !important;
  padding: 6px 22px !important;
  margin-right: 12px !important;
}

.cancel-btn {
  border-radius: 6px !important;
  padding: 6px 22px !important;
  border: 1px solid #e6e6e6 !important;
  color: #666 !important;
  background-color: #f5f5f5 !important;
}

.custom-dialog {
  border-radius: 12px !important;
}

/* 关键修复：精准控制日期选择器宽度，覆盖Element UI默认样式 */
::v-deep .el-date-editor.el-input--small.el-input {
  width: 100% !important;
  max-width: 220px !important;
  /* 限制最大宽度，避免撑满 */
}

::v-deep .el-date-editor.el-input--small .el-input__inner {
  height: 32px !important;
  /* 匹配small尺寸输入框高度 */
}

::v-deep .el-dialog__body {
  padding: 20px !important;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* 适配小屏幕 */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .el-dialog {
    width: 90% !important;
  }

  /* 小屏幕下筛选条件自动换行，每个筛选项占满一行 */
  .el-row > div {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 4px !important;
  }

  ::v-deep .el-date-editor.el-input--small.el-input {
    max-width: 100% !important;
    /* 小屏幕下宽度自适应 */
  }
}
</style>
