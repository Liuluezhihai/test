<template>
  <!-- 图书管理页面根容器 -->
  <el-row
    style="background-color: #FFFFFF; padding: 20px 0; border-radius: 5px;"
  >
    <!-- 筛选条件区域 -->
    <el-row style="padding: 10px; margin: 0 10px;">
      <el-row>
        <!-- 图书名称筛选 -->
        <span class="top-bar">图书名称</span>
        <el-input
          size="small"
          style="width: 100px; margin-right: 10px;"
          v-model="bookQueryDto.bookName"
          placeholder="请输入图书名称"
          clearable
          @clear="handleFilterClear"
        ></el-input>
        <!-- 父分类下拉框 -->
        <el-select
          size="small"
          style="width: 120px; margin-right: 10px;"
          v-model="bookQueryDto.parentCategoryId"
          placeholder="选择父分类"
          clearable
          @change="handleParentCategoryChange"
        >
          <el-option label="无父分类（顶级分类）" :value="0"></el-option>
          <!-- 动态渲染父分类列表，替代写死的选项 -->
          <el-option
            v-for="item in parentCategoryList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>

        <!-- 子分类下拉框（新增：绑定过滤后的） -->
        <span class="top-bar">子分类</span>
        <el-select
          v-model="bookQueryDto.categoryId"
          placeholder="选择子分类"
          size="small"
          style="width: 120px; margin-right: 10px;"
        >
          <el-option
            v-for="item in filteredChildList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>

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

        <!-- 新增图书按钮 -->
        <el-button
          size="small"
          style="background-color: rgb(235, 237, 245); color: rgb(43, 121, 203); border: none;"
          class="customer"
          type="info"
          @click="addBook"
        >
          新增图书
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
          @click="batchDelete"
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

    <!-- 表格及分页区域 → 改为卡片布局 -->
    <el-row style="margin: 10px 20px;">
      <!-- 图书卡片列表（每行4本） -->
      <div class="book-card-container">
        <div class="book-card" v-for="item in tableData" :key="item.bookId">
          <!-- 封面 -->
          <el-avatar
            :size="169"
            :src="item.bookImage"
            class="book-cover"
          ></el-avatar>
          <!-- 信息区域 -->
          <div class="book-info">
            <p class="book-name">{{ item.bookName }}</p>
            <p class="book-meta">作者：{{ item.author }}</p>
            <p class="book-meta">库存：{{ item.stockNum }}本</p>
            <p class="book-meta">
              状态：{{ item.bookStatus === 1 ? "正常" : "下架" }}
            </p>
          </div>
          <!-- 操作按钮 -->
          <div class="book-actions">
            <span class="text-button" @click="handleEdit(item)">编辑</span>
            <span class="text-button" @click="handleDelete(item)">删除</span>
          </div>
        </div>
      </div>

      <!-- 分页组件（改为12/16本每页） -->
      <el-pagination
        style="margin: 20px 0; float: right;"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="current"
        :page-sizes="[12, 16]"
      >
        :page-size="size" layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems" ></el-pagination
      >
    </el-row>

    <!-- 新增/编辑图书弹窗 -->
    <el-dialog
      :show-close="false"
      :visible.sync="dialogBookOperation"
      width="60%"
      top="40px"
      :before-close="handleDialogClose"
      class="custom-dialog"
    >
      <!-- 弹窗标题 -->
      <div slot="title" class="dialog-title-wrap">
        <p class="dialog-title">
          {{ !isEdit ? "新增图书" : "编辑图书信息" }}
        </p>
      </div>

      <!-- 弹窗内容区域 -->
      <div class="dialog-content">
        <!-- 封面上传区域 -->
        <div class="avatar-section">
          <el-upload
            class="avatar-uploader"
            action="api/file/upload"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            name="file"
          >
            <img
              v-if="bookForm.bookImage"
              :src="bookForm.bookImage"
              class="dialog-avatar"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <p class="avatar-tip">点击上传/更换封面（建议200x300px）</p>
        </div>

        <!-- 表单输入区域 -->
        <div class="form-grid">
          <!-- ISBN -->
          <div class="form-item">
            <label class="form-label"
              >ISBN <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model="bookForm.isbn"
              placeholder="请输入ISBN"
              :disabled="isEdit"
            />
          </div>

          <!-- 图书名称 -->
          <div class="form-item">
            <label class="form-label"
              >图书名称 <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model="bookForm.bookName"
              placeholder="请输入图书名称"
            />
          </div>

          <!-- 作者 -->
          <div class="form-item">
            <label class="form-label"
              >作者 <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model="bookForm.author"
              placeholder="请输入作者"
            />
          </div>

          <!-- 出版社 -->
          <div class="form-item">
            <label class="form-label"
              >出版社 <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model="bookForm.publisher"
              placeholder="请输入出版社"
            />
          </div>

          <!-- 出版日期 -->
          <div class="form-item">
            <label class="form-label"
              >出版日期 <span class="required">*</span></label
            >
            <el-date-picker
              v-model="bookForm.publishDate"
              type="date"
              placeholder="选择出版日期"
              class="form-select"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </div>

          <!-- 分类ID -->
          <div class="form-item">
            <label class="form-label"
              >分类ID <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model.number="bookForm.categoryId"
              placeholder="请输入分类ID"
              type="number"
            />
          </div>

          <!-- 库存数量 -->
          <div class="form-item">
            <label class="form-label"
              >库存数量 <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model.number="bookForm.stockNum"
              placeholder="请输入库存数量"
              type="number"
              min="0"
            />
          </div>

          <!-- 书架ID -->
          <div class="form-item">
            <label class="form-label"
              >书架ID <span class="required">*</span></label
            >
            <input
              class="form-input"
              v-model.number="bookForm.bookshelfId"
              placeholder="请输入书架ID"
              type="number"
            />
          </div>

          <!-- 图书状态 -->
          <div class="form-item">
            <label class="form-label"
              >图书状态 <span class="required">*</span></label
            >
            <el-select
              v-model="bookForm.bookStatus"
              placeholder="请选择状态"
              class="form-select"
            >
              <el-option label="正常" :value="1"></el-option>
              <el-option label="下架" :value="0"></el-option>
            </el-select>
          </div>

          <!-- 创建时间（仅编辑显示） -->
          <div class="form-item" v-if="isEdit">
            <label class="form-label">创建时间</label>
            <input
              class="form-input"
              :value="formatDate(bookForm.createdTime)"
              disabled
            />
          </div>
        </div>
      </div>

      <!-- 弹窗底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button
          size="small"
          v-if="!isEdit"
          class="submit-btn"
          type="primary"
          @click="submitAddBook"
        >
          确认新增
        </el-button>
        <el-button
          size="small"
          v-else
          class="submit-btn"
          type="primary"
          @click="submitEditBook"
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
  data() {
    return {
      // 图书查询条件
      bookQueryDto: {
        bookName: "",
        author: "",
        parentCategoryId: "", // 选中的父分类ID（数组，支持多选）
        categoryId: "" // 选中的子分类ID（数组，支持多选）
      },
      // 表格数据
      tableData: [],
      // 分页参数
      current: 1,
      size: 12,
      totalItems: 0,
      // 弹窗状态
      dialogBookOperation: false,
      isEdit: false,
      // 选中行
      selectedRows: [],
      // 分类下拉框数据
      parentCategoryList: [], // 父分类列表（parent_category_id=0/null）
      childCategoryList: [], // 所有子分类列表（后续可联动过滤）
      filteredChildList: [], // 过滤后的子分类列表（联动用）
      // 图书表单数据
      bookForm: {
        bookId: null,
        isbn: "",
        bookName: "",
        author: "",
        publisher: "",
        publishDate: "",
        categoryId: 0,
        stockNum: 0,
        bookshelfId: 0,
        bookStatus: 1,
        createdTime: "",
        bookImage: ""
      }
    };
  },
  created() {
    this.fetchCategoryList();
    this.fetchBookList();
  },
  methods: {
    // 日期格式化
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
    // 修改 fetchCategoryList 方法的子分类查询部分
    async fetchCategoryList() {
      try {
        // 1. 查询所有父分类（parent_category_id=0）
        const parentRes = await this.$axios.post("/bookCategory/query", {
          parentCategoryId: 0 // 传0查顶级分类（父分类）
        });
        if (parentRes.data.code === 200) {
          this.parentCategoryList = parentRes.data.data.map(item => ({
            label: item.categoryName,
            value: item.id // 确保 value 是分类ID（和后端返回的字段匹配）
          }));
        }

        // 2. 修正：查询所有分类，再筛选出子分类（parentCategoryId≠0）
        const allCategoryRes = await this.$axios.post(
          "/bookCategory/query",
          {}
        ); // 传空对象查所有分类
        if (allCategoryRes.data.code === 200) {
          // 筛选子分类（parentCategoryId 不为0且存在）
          this.childCategoryList = allCategoryRes.data.data
            .filter(
              item => item.parentCategoryId && item.parentCategoryId !== 0
            )
            .map(item => ({
              label: item.categoryName,
              value: item.id,
              parentId: item.parentCategoryId // 关联父分类ID，用于联动过滤
            }));
          this.filteredChildList = [...this.childCategoryList]; // 初始显示所有子分类
        }
      } catch (error) {
        console.error("加载分类失败:", error);
        this.$message.error("加载分类数据失败");
      }
    },
    // 新增：父分类变化时，过滤子分类
    handleParentCategoryChange(selectedParentId) {
      if (!selectedParentId) {
        // 未选父分类：显示所有子分类
        this.filteredChildList = [...this.childCategoryList];
      } else {
        // 选中父分类：只显示该父分类下的子分类（parentId=选中的父分类ID）
        this.filteredChildList = this.childCategoryList.filter(
          item => item.parentId === selectedParentId
        );
        this.bookQueryDto.categoryId = ""; // 清空已选子分类
      }
    },
    // 封面上传成功回调
    handleCoverSuccess(res) {
      if (res.code !== 200) {
        this.$message.error("封面上传失败");
        return;
      }
      this.$message.success("封面上传成功");
      this.bookForm.bookImage = res.data;
    },

    // 表格多选事件
    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    // 加载图书列表
    // 加载图书列表（修改后）
    async fetchBookList() {
      try {
        // 构造筛选参数：合并父分类和子分类ID（后端按category_id匹配）

        const params = {
          // 基础筛选条件
          bookName: this.bookQueryDto.bookName || undefined,
          author: this.bookQueryDto.author || undefined,
          isbn: this.bookQueryDto.isbn || undefined,
          bookStatus: this.bookQueryDto.bookStatus,

          // 核心：单独传递父/子分类ID数组（支持多选）
          parentCategoryId: this.bookQueryDto.parentCategoryId || undefined,
          categoryId: this.bookQueryDto.categoryId || undefined,
          // 分页参数
          current: this.current,
          size: this.size
        };

        const response = await this.$axios.post("/book/query", params);
        if (response.data.code === 200) {
          this.tableData = response.data.data;
          this.totalItems = response.data.total;
        }
      } catch (error) {
        console.error("查询图书列表失败:", error);
        this.$message.error("查询数据失败");
      }
    },

    // 新增图书弹窗
    addBook() {
      this.isEdit = false;
      this.resetBookForm();
      this.dialogBookOperation = true;
    },

    // 编辑图书
    handleEdit(row) {
      this.isEdit = true;
      this.bookForm = { ...row };
      this.dialogBookOperation = true;
    },

    // 重置图书表单
    resetBookForm() {
      this.bookForm = {
        bookId: null,
        isbn: "",
        bookName: "",
        author: "",
        publisher: "",
        publishDate: "",
        categoryId: 0,
        stockNum: 0,
        bookshelfId: 0,
        bookStatus: 1,
        createdTime: "",
        bookImage: ""
      };
    },

    // 关闭弹窗
    handleDialogClose() {
      this.dialogBookOperation = false;
      setTimeout(() => {
        this.resetBookForm();
        this.isEdit = false;
      }, 300);
    },

    // 提交新增图书
    async submitAddBook() {
      if (
        !this.bookForm.isbn ||
        !this.bookForm.bookName ||
        !this.bookForm.author ||
        !this.bookForm.publisher
      ) {
        this.$message.error("带*的字段不能为空");
        return;
      }

      try {
        const response = await this.$axios.post("/book/save", this.bookForm);
        if (response.data.code === 200) {
          this.$message.success("新增图书成功");
          this.handleDialogClose();
          this.fetchBookList();
        } else {
          this.$message.error(response.data.msg);
        }
      } catch (error) {
        console.error("新增图书失败:", error);
        this.$message.error("新增图书失败");
      }
    },

    // 提交编辑图书
    async submitEditBook() {
      if (
        !this.bookForm.bookName ||
        !this.bookForm.author ||
        !this.bookForm.publisher
      ) {
        this.$message.error("带*的字段不能为空");
        return;
      }

      try {
        const response = await this.$axios.put("/book/update", this.bookForm);
        if (response.data.code === 200) {
          this.$message.success("编辑图书成功");
          this.handleDialogClose();
          this.fetchBookList();
        } else {
          this.$message.error(response.data.msg);
        }
      } catch (error) {
        console.error("编辑图书失败:", error);
        this.$message.error("编辑图书失败");
      }
    },

    // 单条删除
    handleDelete(row) {
      this.selectedRows = [row];
      this.batchDelete();
    },

    // 批量删除
    // 批量删除（最终修正版：点击空白处/取消不删除，仅确定删除执行逻辑）
    async batchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning("请选择要删除的图书");
        return;
      }

      // 1. 弹出确认弹窗，配置允许空白处关闭
      const swalResult = await this.$swal.fire({
        title: "确认删除",
        text: "删除后数据不可恢复，是否继续？",
        icon: "warning",
        showCancelButton: true, // 显示取消按钮
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6e7891",
        allowOutsideClick: true, // 允许点击空白处关闭弹窗（关键）
        allowEscapeKey: true, // 允许ESC键关闭
        backdrop: true // 显示遮罩层
      });

      // 2. 核心判断：只有点击“确定删除”（isConfirmed为true）才执行删除
      // 点击空白处、取消按钮、ESC键 → isConfirmed均为false，不执行删除
      if (!swalResult.isConfirmed) {
        this.$message.info("已取消删除操作"); // 给出取消提示（可选，提升体验）
        return; // 直接返回，终止删除逻辑
      }

      // 3. 确认删除：执行后端请求
      try {
        const bookIds = this.selectedRows.map(item => item.bookId);
        const response = await this.$axios.post("/book/batchDelete", bookIds);
        if (response.data.code === 200) {
          this.$message.success("删除成功");
          this.fetchBookList(); // 刷新列表
        } else {
          this.$message.error(response.data.msg);
        }
      } catch (error) {
        console.error("删除图书失败:", error);
        this.$message.error("删除图书失败");
      }
    },

    // 筛选查询
    handleFilter() {
      this.current = 1;
      this.fetchBookList();
    },

    // 清空筛选条件
    handleFilterClear() {
      this.bookQueryDto = {
        bookName: "",
        author: "",
        parentCategoryId: "",
        categoryId: ""
      }; // 修正：重置单选子分类ID };
      this.publishTimeRange = [];
      this.handleFilter();
    },

    // 重置查询条件
    resetQueryCondition() {
      this.bookQueryDto = {
        bookName: "",
        author: "",
        parentCategoryId: "",
        categoryId: ""
      };
      this.publishTimeRange = [];
      this.current = 1;
      this.fetchBookList();
    },

    // 每页条数改变
    handleSizeChange(val) {
      this.size = val;
      this.current = 1;
      this.fetchBookList();
    },

    // 页码改变
    handleCurrentChange(val) {
      this.current = val;
      this.fetchBookList();
    }
  }
};
</script>

<style scoped lang="scss">
/* 复用原样式，与用户管理页面保持一致 */
.top-bar {
  display: inline-block;
  margin-right: 8px;
  font-size: 14px;
  color: #606266;
}

.customer {
  margin: 0 8px;
  border-radius: 4px !important;
}

.text-button {
  display: inline-block;
  margin: 0 8px;
  color: rgb(43, 121, 203);
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
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

.avatar-section {
  text-align: center;
  margin-bottom: 25px;
}

.dialog-avatar {
  width: 120px;
  height: 180px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 180px;
  line-height: 180px;
  text-align: center;
  border: 1px dashed #dcdcdc;
  border-radius: 8px;
}

.avatar-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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
  height: 36px;
  box-sizing: border-box;

  &:focus {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
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

::v-deep .el-dialog__body {
  padding: 20px !important;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

@media (max-width: 1200px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* 卡片容器：每行4本，自动换行 */
/* 卡片容器：使用Grid布局，每行4列 */
.book-card-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  /* 每行4本 */
  gap: 20px;
  padding: 10px 0;
  width: 100%;
  box-sizing: border-box;
}

/* 单本图书卡片 */
.book-card {
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
  min-width: 0;
  /* 防止内容溢出 */
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .book-card-container {
    grid-template-columns: repeat(3, 1fr);
    /* 每行3本 */
  }
}

@media (max-width: 768px) {
  .book-card-container {
    grid-template-columns: repeat(2, 1fr);
    /* 每行2本 */
  }
}

@media (max-width: 480px) {
  .book-card-container {
    grid-template-columns: 1fr;
    /* 每行1本 */
  }
}

/* 图书封面 */
.book-cover {
  margin-bottom: 0px;
  object-fit: cover;
  border-radius: 1px;
  width: 180px;
  /* 自定义宽度 */
  height: 200px;
  /* 自定义高度（宽高比3:2，长方形效果） */
}

/* 关键：覆盖el-avatar默认的正方形样式（必须加，否则宽高不生效） */
::v-deep .el-avatar.book-cover {
  width: 180px !important;
  height: 200px !important;
  line-height: 180px !important;
  /* 让图标垂直居中（未上传图片时） */
}

/* 图书信息 */
.book-info {
  width: 100%;
  margin-bottom: 2px;
  line-height: 1;
}

.book-name {
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-meta {
  font-size: 13px;
  color: #666;
  margin: 2px 0;
}

/* 操作按钮 */
.book-actions {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>
