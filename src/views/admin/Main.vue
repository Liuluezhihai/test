<template>
  <!-- 数据总览页面根容器 -->
  <div style="padding: 10px; overflow-y: auto; height: calc(100vh - 100px);">
    <!-- 栅格布局：修正列数总和为24 -->
    <el-row :gutter="15">
      <!-- gutter：列之间间距15px -->
      <!-- 第一行：饼图（9份）+ 柱状图（15份）= 24份 -->
      <el-col :span="9">
        <div class="chart-card">
          <PieChart
            fontColor="#000"
            bag="rgb(236, 245, 255)"
            tag="图书分类数据"
            :values="pieValues"
            :types="pieTypes"
          />
        </div>
      </el-col>

      <el-col :span="15">
        <!-- 修正为15份，与左侧9份凑24 -->
        <div class="chart-card">
          <!-- 移除冗余的 fontColor/bag 属性（柱状图组件未使用） -->
          <BarChart
            height="310px"
            tag="借阅记录数"
            @on-selected="recordDatesSelected"
            :values="recordValues"
            :date="recordDates"
          />
        </div>
      </el-col>
    </el-row>
    <!-- 第二行：折线图（独占24份） -->
    <el-row :gutter="15" style="margin-top: 15px;">
      <el-col :span="24">
        <!-- 修正为24份，独占一行 -->
        <div class="chart-card">
          <LineChart
            height="310px"
            tag="用户数"
            @on-selected="userDatesSelected"
            :values="userValues"
            :date="userDates"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import LineChart from "@/components/LineChart";
import PieChart from "@/components/PieChart";
import BarChart from "@/components/BarChart";

export default {
  components: { LineChart, PieChart, BarChart },
  data() {
    return {
      userValues: [],
      userDates: [],
      recordValues: [],
      recordDates: [],
      pieValues: [],
      pieTypes: []
    };
  },
  created() {
    this.initData(); // 统一初始化数据
  },
  methods: {
    // 统一初始化方法，优化代码结构
    initData() {
      this.userDatesSelected(365);
      this.recordDatesSelected(365);
      this.loadPieCharts();
    },

    loadPieCharts() {
      this.$axios
        .get(`/book/count`)
        .then(response => {
          const { data } = response;
          if (data.code === 200) {
            this.pieValues = data.data.map(entity => entity.count);
            this.pieTypes = data.data.map(entity => entity.name);
          }
        })
        .catch(err => {
          console.error("加载图书分类数据失败：", err);
        });
    },

    userDatesSelected(time) {
      this.$axios
        .get(`/user/daysQuery/${time}`)
        .then(response => {
          const { data } = response;
          if (data.code === 200) {
            this.userValues = data.data.map(entity => entity.count);
            this.userDates = data.data.map(entity => entity.name);
          }
        })
        .catch(err => {
          console.error("加载用户数据失败：", err);
        });
    },

    // 借阅记录使用专属接口
    recordDatesSelected(time) {
      
      this.$axios
        .get(`/borrowRecord/daysQuery/${time}`)
        .then(response => {
          const { data } = response;
          if (data.code === 200) {
            this.recordValues = data.data.map(entity => entity.count); // 借阅次数
            this.recordDates = data.data.map(entity => entity.name);
          }
        })
        .catch(err => {
          console.error("加载借阅记录数据失败：", err);
          this.recordValues = [];
          this.recordDates = [];
        });
    }
  }
};
</script>

<style scoped lang="scss">
/* 图表卡片样式，统一外观 */
.chart-card {
  background: #fff;
  border-radius: 6px;
  padding: 10px;
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.status-success {
  display: inline-block;
  padding: 1px 5px;
  border-radius: 2px;
  background-color: rgb(201, 237, 249);
  color: rgb(111, 106, 196);
  font-size: 12px;
}

.status-error {
  display: inline-block;
  padding: 1px 5px;
  border-radius: 2px;
  background-color: rgb(233, 226, 134);
  color: rgb(111, 106, 196);
  font-size: 12px;
}
</style>
