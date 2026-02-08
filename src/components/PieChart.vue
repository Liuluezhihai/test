<template>
  <!-- 饼状图组件根容器 -->
  <!-- :style="{ backgroundColor: bag }": 动态绑定背景色，值为父组件传入的bag属性 -->
  <div class="line-main" :style="{ backgroundColor: bag }">
    <!-- 饼状图标题容器 -->
    <div>
      <!-- 饼状图标题文本 -->
      <!-- class="tag": 标题样式类 -->
      <!-- :style="{ color: fontColor }": 动态绑定标题颜色，值为父组件传入的fontColor属性 -->
      <span class="tag" :style="{ color: fontColor }"> {{ tag }}</span>
      <!-- 标题文本，绑定父组件传入的tag属性 -->
    </div>
    <!-- 饼状图渲染容器 -->
    <!-- ref="chart": 给容器绑定引用，用于ECharts初始化 -->
    <!-- :style: 动态绑定样式，宽度和高度分别绑定父组件传入的width和height属性 -->
    <div ref="chart" :style="{ width: width, height: height }"></div>
  </div>
</template>

<script>
// 导入ECharts库，用于绘制饼状图
import * as echarts from "echarts";

// 导出饼状图组件
export default {
  // 组件名称
  name: "PieChart",
  // 组件接收的props参数（父组件传递的属性）
  props: {
    // 饼状图分类名称数组（如各部分的名称）
    types: {
      type: Array, // 数据类型为数组
      default: () => [] // 默认值为空数组
    },
    // 饼状图对应分类的数值数组（如各部分的占比/数量）
    values: {
      type: Array, // 数据类型为数组
      default: () => [] // 默认值为空数组
    },
    // 图表宽度
    width: {
      type: String, // 数据类型为字符串（支持带单位，如"100%"、"300px"）
      default: "100%" // 默认宽度为100%（自适应父容器）
    },
    // 图表标题
    tag: {
      type: String, // 数据类型为字符串
      default: "饼状图" // 默认标题为"饼状图"
    },
    // 图表高度
    height: {
      type: String, // 数据类型为字符串（支持带单位，如"243px"、"300px"）
      default: "290px" 
    },
    // 组件背景色
    bag: {
      type: String, // 数据类型为字符串（支持颜色值，如"#fff"、"red"）
      default: "#fff" // 默认背景色为白色
    },
    // 标题文字颜色
    fontColor: {
      type: String, // 数据类型为字符串（支持颜色值，如"#333"、"#fff"）
      default: "#000" // 默认文字颜色为深灰色
    }
  },
  // 组件数据
  data() {
    return {
      chart: null // 存储ECharts实例对象，初始为null
    };
  },
  // 监听属性变化
  watch: {
    /**
     * 监听分类名称数组（types）变化
     * @param {Array} v1 - 新的分类名称数组
     * @param {Array} v2 - 旧的分类名称数组
     */
    types() {// 当types属性变化时触发
      // 分类名称变化后重新初始化图表，更新视图
      this.initChart();
    }
  },
  // 组件挂载完成生命周期钩子
  mounted() {
    // 页面加载完成后初始化图表
    this.initChart();
  },
  // 组件方法
  methods: {
    /**
     * 图表初始化：创建ECharts实例并配置渲染饼状图
     */
    initChart() {
      // 通过ref获取图表容器DOM元素，初始化ECharts实例
      this.chart = echarts.init(this.$refs.chart);
      // 定义ECharts配置项(全局配置)
      let option = {
        // 图表标题配置
        title: {
          text: "", // 主标题文本为空（不显示主标题）
          subtext: "", // 副标题文本为空（不显示副标题）
          left: "center" // 标题位置：居中（因文本为空，实际无效果）
        },
        // 提示框配置（鼠标悬浮时显示的数据提示）
        tooltip: {
          trigger: "item" // 触发方式：按数据项触发（饼状图常用，点击/悬浮单个扇形触发）
        },
        // 图例配置
        legend: {
          orient: "vertical", // 图例排列方向：垂直排列
          left: "left", // 图例位置：左侧
          show: false // 是否显示图例：否（隐藏图例）
        },
        // 系列数据（图表配置）
        series: [
          {
            name: "", // 系列名称（为空，不影响显示）
            type: "pie", // 图表类型：饼状图
            radius: "70%", // 饼状图半径：占容器的70%（内半径默认0，形成实心饼图）
            avoidLabelOverlap: false, // 是否避免标签重叠：否
            emphasis: {
              // 高亮状态配置（鼠标悬浮时的样式）
              label: {
                show: false, // 高亮时是否显示标签：否
                fontSize: "24", // 高亮时标签字体大小24px（因show为false，实际无效果）
                fontWeight: "600" // 高亮时标签字体粗细600（因show为false，实际无效果）
              }
            },
            labelLine: {
              show: true // 是否显示标签引导线：是（连接扇形与标签的线）
            },
            label: {
              show: true, // 是否显示标签：是
              position: "outer", // 标签位置：扇形外部
              formatter: "{d}%" // 标签格式化：显示百分比（{d}表示占比百分比）
            },
            // 饼状图数据：将values和types数组映射为ECharts需要的格式（[{name: 分类名, value: 数值}, ...]）
            data: this.values.map((value, index) => ({
              name: this.types[index], // 分类名称：对应types数组的当前索引项
              value: value // 数值：对应values数组的当前索引项
            })),
            // 扇形区域样式配置（自定义颜色）
            itemStyle: {
              // 颜色回调函数：根据数据索引返回对应颜色
              color: function(params) {
                // 预定义颜色数组（支持7种颜色，循环使用）
                const colorList = [
                  "#409EFF", // 蓝色
                  "#67C23A", // 绿色
                  "#E6A23C", // 橙色
                  "#F56C6C", // 红色
                  "#909399", // 灰色
                  "#E4E7ED", // 浅灰色
                  "#F2F6FC" // 极浅灰色
                ];
                // 返回颜色：根据数据索引对颜色数组长度取余，实现循环配色
                return colorList[params.dataIndex % colorList.length];
              }
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
    // 如果ECharts实例存在，销毁实例释放资源（避免内存泄漏）
    if (this.chart) {
      this.chart.dispose();
    }
  }
};
</script>

<style scoped lang="scss">
// 饼状图组件根容器样式
.line-main {
  padding-top: 10px; // 顶部内边距10px（与标题保持间距）
  margin-bottom: 5px; // 底部外边距5px（与其他元素分隔）
  border-radius: 3px; // 容器圆角3px
  background-color: #000000; // 背景色为黑色（注：会被模板中动态绑定的backgroundColor覆盖）

  // 标题文本样式
  .tag {
    font-size: 14px; // 字体大小14px
    text-align: center; // 文本居中对齐
    padding: 15px 6px; // 内边距：上下15px，左右6px
    display: block; // 块级显示，使标题独占一行并支持居中
  }
}
</style>
