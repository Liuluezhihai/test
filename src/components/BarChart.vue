<template>
  <!-- 柱状图组件根容器：scoped样式仅作用于当前组件 -->
  <div class="bar-main">
    <!-- 标题与时间选择器区域：包含图表标题和时间筛选下拉框 -->
    <div class="bar-header">
      <!-- 图表标题：通过props接收父组件传递的标题文本 -->
      <span class="tag">{{ tag }}</span>
      <!-- 时间选择器（与折线图交互一致）：用于切换不同时间维度的数据 -->
      <div class="time-selector">
        <!-- 时间选择标签：静态文本提示 -->
        <span class="time-label" style="font-size: 12px;">时间选择</span>
        <!-- Element UI下拉选择器：mini尺寸，宽度90px，左间距8px -->
        <!-- v-model绑定组件内部的selectedValue，用于双向绑定选中值 -->
        <el-select
          size="mini"
          style="width: 90px; margin-left: 8px;"
          v-model="selectedValue"
          placeholder="选择期限"
        >
          <!-- 循环渲染下拉选项：key绑定唯一标识num，label显示名称，value绑定数值 -->
          <el-option
            v-for="item in timeOptions"
            :key="item.num"
            :label="item.name"
            :value="item.num"
          ></el-option>
        </el-select>
      </div>
    </div>
    <!-- 图表渲染容器：通过ref="chart"让ECharts获取DOM元素 -->
    <!-- 行内样式绑定宽度100%，高度通过props接收（默认300px） -->
    <div ref="chart" :style="{ width: '100%', height: height }"></div>
  </div>
</template>

<script>
// 导入ECharts核心库，用于创建柱状图实例
import * as echarts from "echarts";

// 导出Vue组件对象（选项式API写法）
export default {
  // 组件名称：用于Vue Devtools识别、递归组件等
  name: "BarChart",
  // 接收父组件传递的属性（Props）
  props: {
    // 图表高度：字符串类型（支持px/%），默认300px
    height: {
      type: String,
      default: "300px"
    },
    // 图表标题：字符串类型，默认"柱状图"
    tag: {
      type: String,
      default: "柱状图"
    },
    // 柱状图数值数组：数组类型，必传（父组件必须传递）
    values: {
      type: Array,
      required: true
    },
    // X轴日期数组：数组类型，必传（父组件必须传递）
    date: {
      type: Array,
      required: true
    }
  },
  // 组件内部响应式数据
  data() {
    return {
      // 存储ECharts实例对象，初始为null
      chart: null,
      // 时间选择器默认选中值：365天
      selectedValue: 365,
      // 时间选择下拉选项数组：与折线图保持一致的交互选项
      timeOptions: [
        { num: 7, name: "7天内" }, // 7天选项：值7，显示名称"7天内"
        { num: 30, name: "30天内" }, // 30天选项
        { num: 60, name: "60天内" }, // 60天选项
        { num: 365, name: "365天内" } // 365天选项
      ]
    };
  },
  // 监听属性变化，触发对应逻辑
  watch: {
    // 监听时间选择器选中值变化
    selectedValue(newVal) {
      // 向父组件触发自定义事件on-selected，传递新选中的时间值（子传父通信）
      this.$emit("on-selected", newVal);
    },
    // 监听数值数组values变化（父组件传递的数据更新）
    values() {
      // 重新初始化图表，更新柱状图数据
      this.initChart();
    }
  },
  // 组件挂载完成生命周期钩子（DOM已渲染完成）
  mounted() {
    // 初始化ECharts柱状图
    this.initChart();
    // 监听浏览器窗口resize事件，实现图表响应式适配
    window.addEventListener("resize", () => {
      // 若图表实例存在，调用resize方法适配新窗口尺寸
      this.chart && this.chart.resize();
    });
  },
  // 组件方法定义
  methods: {
    // 初始化/更新柱状图核心方法
    initChart() {
      // 安全校验：若未获取到chart容器DOM，直接返回（避免报错）
      if (!this.$refs.chart) return;

      // 基于chart容器DOM创建ECharts实例，并赋值给组件内部的chart变量
      this.chart = echarts.init(this.$refs.chart);
      // 定义ECharts配置项（柱状图核心规则）
      const option = {
        // 网格配置：控制图表绘图区域的边距
        grid: {
          left: "30px", // 左间距30px
          right: "15px", // 右间距15px
          top: "40px", // 上间距40px
          bottom: "30px", // 下间距30px
          borderWidth: 0 // 网格边框宽度0（隐藏边框）
        },
        // 提示框配置：鼠标悬浮柱子时显示的提示信息
        tooltip: {
          trigger: "axis", // 触发方式：坐标轴触发（柱状图常用）
          formatter: "{b}：{c} 次", // 提示文本格式化：X轴名称 + 数值 + 单位（借阅次数）
          backgroundColor: "rgba(255,255,255,0.9)", // 提示框背景色（白色半透明）
          borderColor: "#eee", // 提示框边框色
          borderWidth: 1 // 提示框边框宽度
        },
        // X轴配置
        xAxis: {
          data: this.date, // X轴数据：绑定父组件传递的日期数组
          axisLine: { show: false }, // 隐藏X轴线
          axisTick: { show: false }, // 隐藏X轴刻度
          axisLabel: {
            // X轴标签样式
            color: "rgb(102, 102, 102)", // 标签文字颜色（灰色）
            fontSize: 12, // 字体大小12px
            interval: 0, // 强制显示所有标签（不自动隐藏）
            rotate: 30 // 标签旋转30度，避免文字重叠
          }
        },
        // Y轴配置
        yAxis: {
          axisLine: { show: false }, // 隐藏Y轴线
          axisTick: { show: false }, // 隐藏Y轴刻度
          axisLabel: {
            // Y轴标签样式
            color: "rgb(102, 102, 102)", // 文字颜色（灰色）
            fontSize: 12 // 字体大小12px
          },
          splitLine: {
            // Y轴横向分割线（网格线）
            color: "rgba(0,0,0,0.05)" // 分割线颜色（极浅黑色，提升可读性）
          }
        },
        // 系列数据（柱状图核心）
        series: [
          {
            type: "bar", // 图表类型：柱状图
            data: this.values, // 柱子数值：绑定父组件传递的values数组
            barWidth: "35%", // 柱子宽度：占类目宽度的35%（优化视觉效果）
            itemStyle: {
              // 柱子样式配置
              // 自定义柱子颜色：根据数据索引循环使用颜色数组
              color: function(params) {
                // 预定义颜色数组（2种颜色，循环使用）
                const colorList = [
                  "#4895ef", // 蓝色
                  "#38b000" // 绿色
                ];
                // 索引取余实现颜色循环
                return colorList[params.dataIndex % colorList.length];
              },
              borderRadius: [4, 4, 0, 0] // 柱子顶部圆角（左上、右上圆角4px，底部无圆角）
            },
            label: {
              // 柱子顶部数值标签配置
              show: true, // 显示标签
              position: "top", // 标签位置：柱子顶部
              color: "rgb(70,70,70)", // 标签文字颜色（深灰色）
              fontSize: 11 // 标签字体大小11px
            }
          }
        ]
      };

      // 将配置项应用到ECharts实例，渲染/更新柱状图
      this.chart.setOption(option);
    }
  },
  // 组件销毁前生命周期钩子：清理资源，避免内存泄漏
  beforeDestroy() {
    // 若ECharts实例存在
    if (this.chart) {
      // 销毁ECharts实例，释放内存
      this.chart.dispose();
      // 移除窗口resize事件监听（避免事件残留）
      window.removeEventListener("resize", this.chart.resize);
    }
  }
};
</script>

<!-- 组件样式：scoped表示样式仅作用于当前组件，lang="scss"支持SCSS语法 -->
<style scoped lang="scss">
// 柱状图根容器样式
.bar-main {
  margin-bottom: 10px; // 底部外边距10px
  border-radius: 6px; // 圆角6px
  padding: 0 8px; // 左右内边距8px，上下无内边距
  box-sizing: border-box; // 盒模型：内边距/边框计入宽度

  // 标题与时间选择器容器样式
  .bar-header {
    display: flex; // 弹性布局
    justify-content: space-between; // 两端对齐（标题左，时间选择器右）
    align-items: center; // 垂直居中
    padding: 12px 0; // 上下内边距12px，左右无

    // 图表标题样式
    .tag {
      font-size: 16px; // 字体大小16px
      font-weight: 600; // 字体加粗（600）
      color: #333; // 文字颜色（深灰色）
      display: inline-block; // 行内块级元素
    }

    // 时间选择器容器样式
    .time-selector {
      display: flex; // 弹性布局
      align-items: center; // 垂直居中
      color: #666; // 文字颜色（中灰色）
    }
  }
}

// 深度选择器：修改Element UI下拉选择器的默认样式（scoped样式穿透）
::v-deep .el-select--mini .el-select__inner {
  font-size: 12px; // 下拉框输入框字体大小12px
  height: 28px; // 输入框高度28px
  line-height: 28px; // 行高28px（垂直居中）
}
</style>
