<template>
  <!-- 折线图组件根容器 -->
  <div class="line-main">
    <!-- 顶部标签与时间选择器容器 -->
    <div>
      <!-- 图表标题标签，绑定父组件传入的tag属性 -->
      <span class="tag">{{ tag }}</span>
      <!-- 时间选择器区域 -->
      <span class="time-show">
        <!-- 时间选择提示文本 -->
        <span class="top-bar" style="font-size: 12px;">时间选择</span>
        <!-- Element UI下拉选择器，用于选择时间期限 -->
        <!-- size="mini": 选择器尺寸为迷你型 -->
        <!-- style="width: 90px": 固定宽度90px -->
        <!-- v-model="selectedValue": 双向绑定选中的时间期限值 -->
        <!-- placeholder="期限": 未选择时的提示文本 -->
        <el-select
          size="mini"
          style="width: 90px;"
          v-model="selectedValue"
          placeholder="期限"
        >
          <!-- 遍历时间选项数组，渲染下拉选项 -->
          <!-- v-for="item in options": 循环渲染options数组中的选项 -->
          <!-- :key="item.num": 选项唯一标识，使用num字段 -->
          <!-- :label="item.name": 选项显示文本，使用name字段 -->
          <!-- :value="item.num": 选项绑定值，使用num字段 -->
          <el-option
            v-for="item in options"
            :key="item.num"
            :label="item.name"
            :value="item.num"
          >
          </el-option>
        </el-select>
      </span>
    </div>
    <!-- 折线图渲染容器 -->
    <!-- ref="chart": 给容器绑定引用，用于ECharts初始化 -->
    <!-- :style: 动态绑定样式，宽度100%，高度绑定父组件传入的height属性 -->
    <div ref="chart" :style="{ width: '100%', height: height }"></div>
  </div>
</template>

<script>
// 导入ECharts库，用于绘制折线图
import * as echarts from "echarts";

// 导出折线图组件
export default {
  // 组件名称
  name: "DialogLine",
  // 组件接收的props参数
  props: {
    // 图表标题标签
    tag: {
      type: String, // 数据类型为字符串
      default: "折线图" // 默认值为"折线图"
    },
    // 折线图数据数组（Y轴数据）
    values: {
      type: Array, // 数据类型为数组
      required: true // 必传参数
    },
    // 折线图X轴日期数组
    date: {
      type: Array, // 数据类型为数组
      required: true // 必传参数
    },
    // 图表高度
    height: {
      type: String, // 数据类型为字符串（支持带单位的数值，如"220px"）
      default: "220px" // 默认高度为220px
    }
  },
  // 监听属性变化
  watch: {
    /**
     * 监听时间选择器选中值变化
     * @param {number} v1 - 新选中的值
     * @param {number} v2 - 旧选中的值
     */
    selectedValue(v1) {
      // 向父组件触发事件，传递选中的时间期限值
      this.$emit("on-selected", v1);
    },
    /**
     * 监听图表数据（values）变化
     * @param {Array} v1 - 新的数据数组
     * @param {Array} v2 - 旧的数据数组
     */
    values() {
      // 数据变化后重新初始化图表，更新视图
      this.initChart();
    }
  },
  // 组件数据
  data() {
    return {
      chart: null, // 存储ECharts实例对象，初始为null
      // 时间选择器选项：7天内、30天内、60天内
      options: [
        { num: 7, name: "7天内" },
        { num: 30, name: "30天内" },
        { num: 60, name: "60天内" }
      ],
      selectedValue: "" // 时间选择器选中值，初始为空
    };
  },
  // 组件方法
  methods: {
    /**
     * 图表初始化：创建ECharts实例并配置渲染
     */
    initChart() {
      // 通过ref获取图表容器DOM元素，初始化ECharts实例
      this.chart = echarts.init(this.$refs.chart);
      // 定义ECharts配置项
      let option = {
        // 图表网格配置（控制图表在容器中的位置和边距）
        grid: {
          left: 30, // 距离容器左侧30px
          right: 10, // 距离容器右侧10px
          top: 50, // 距离容器顶部50px
          borderWidth: 0 // 网格边框宽度为0（隐藏边框）
        },
        // 图表标题配置
        title: {
          text: "", // 标题文本为空（不显示标题）
          color: "#ffffff" // 标题颜色（因文本为空，实际无效果）
        },
        // 提示框配置（鼠标悬浮时显示的数据提示）
        tooltip: {
          trigger: "axis", // 触发方式：按坐标轴触发（折线图常用）
          formatter: "{b}{c}" // 提示框格式化：显示X轴数据（b）和Y轴数据（c）
        },
        // 图例配置
        legend: {
          data: [""] // 图例数据为空（不显示图例）
        },
        // X轴配置
        xAxis: {
          data: this.date, // X轴数据绑定父组件传入的date数组
          axisLine: { show: false }, // 隐藏X轴轴线
          axisTick: { show: false }, // 隐藏X轴刻度线
          axisLabel: {
            color: "rgb(102, 102, 102)", // X轴标签颜色（灰色）
            fontSize: "12" // X轴标签字体大小12px
          }
        },
        // Y轴配置
        yAxis: {
          axisLine: { show: false }, // 隐藏Y轴轴线
          axisTick: { show: false }, // 隐藏Y轴刻度线
          axisLabel: {
            color: "rgb(102, 102, 102)", // Y轴标签颜色（灰色）
            fontSize: "12", // Y轴标签字体大小12px
            formatter: "{value}" // 标签格式化：直接显示数值
          }
        },
        // 系列数据（折线图核心配置）
        series: [
          {
            name: "", // 系列名称（为空，不影响显示）
            type: "line", // 图表类型：折线图
            smooth: true, // 线条是否平滑：是（曲线）
            data: this.values, // 系列数据绑定父组件传入的values数组（Y轴数据）
            // 区域填充样式（折线下方填充）
            areaStyle: {
              color: "rgba(144, 191, 237, 0.3)" // 填充颜色：浅蓝色，透明度0.3
            },
            // 线条样式
            lineStyle: {
              color: "#5B8FF9" // 线条颜色：深蓝色
            },
            // 数据点样式
            itemStyle: {
              color: "#5B8FF9", // 数据点颜色：深蓝色
              borderColor: "#5B8FF9", // 数据点边框颜色：深蓝色
              borderWidth: 2 // 数据点边框宽度2px
            },
            // 数据标签（数据点上方显示数值）
            label: {
              show: true, // 是否显示：是
              position: "top", // 标签位置：数据点上方
              color: "rgb(102, 102, 102)" // 标签颜色（灰色）
            }
          }
        ]
      };
      // 将配置项应用到ECharts实例，渲染图表
      this.chart.setOption(option);
    }
  },
  // 组件销毁前生命周期钩子
  beforeDestroy() {
    // 如果ECharts实例存在，销毁实例释放资源
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
  }
};
</script>

<style scoped lang="scss">
// 折线图组件根容器样式
.line-main {
  margin-bottom: 5px; // 底部外边距5px（与其他元素分隔）
  border-radius: 3px; // 容器圆角3px

  // 图表标题标签样式
  .tag {
    font-size: 16px; // 字体大小16px
    padding: 15px 6px; // 内边距：上下15px，左右6px
    display: inline-block; // 行内块级元素（支持padding和margin）
    color: #333; // 字体颜色：深灰色
    font-weight: bold; // 字体粗细：加粗
  }

  // 时间选择器区域样式
  .time-show {
    padding: 15px 6px; // 内边距：上下15px，左右6px
    float: right; // 右浮动（与标题标签左右分布）
  }
}
</style>
