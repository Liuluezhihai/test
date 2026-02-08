// 插件文件名：swalPlugin.js（封装SweetAlert2弹窗组件，提供Vue全局调用方法）
// 导入SweetAlert2库（用于创建美观的弹窗提示，替代原生alert/confirm）
import Swal from "sweetalert2";

/**
 * 插件使用说明（示例）：
 * 1. 提示型弹窗（无确认/取消按钮，自动关闭）：
 * this.$swal.fire({
 *   title: '退出登录',
 *   text: '您已成功退出登录。',
 *   icon: 'success', // 图标类型：success/error/info/warning/question（五种可选）
 *   showConfirmButton: false, // 隐藏确认按钮，仅展示信息
 *   timer: 2000, // 自动关闭延迟：2秒（2000毫秒）
 * });
 *
 * 2. 确认型弹窗（带确认/取消按钮，需用户操作）：
 * const isConfirmed = await this.$swalConfirm({
 *   title: '删除确认',
 *   text: '确定要删除该数据吗？删除后不可恢复！',
 *   icon: 'warning'
 * });
 * if (isConfirmed) {
 *   // 用户点击"确认"后的逻辑
 * }
 */

// 定义Vue插件对象：用于全局注册$swalConfirm方法
const swalPlugin = {
  /**
   * 插件安装方法（Vue插件必须实现的install方法）
   * @param {Vue} Vue - Vue构造函数
   */
  install(Vue) {
    // 给Vue原型挂载$swalConfirm方法，所有Vue组件可通过this.$swalConfirm调用
    // 该方法为异步方法，返回Promise，resolve结果为布尔值（true=确认，false=取消/失败）
    Vue.prototype.$swalConfirm = async function(options = {}) {
      // 定义确认型弹窗的默认配置（用户未传的配置将使用默认值）
      const defaultOptions = {
        title: "提示", // 弹窗标题默认值
        text: "", // 弹窗正文文本默认值（空）
        icon: "info", // 弹窗图标默认值：信息型（info）
        reverseButtons: true, // 反转按钮顺序：确认按钮在右侧，取消按钮在左侧（符合中文操作习惯）
        showCancelButton: true, // 显示取消按钮（确认型弹窗核心配置）
        confirmButtonText: "确认", // 确认按钮文本
        cancelButtonText: "取消", // 取消按钮文本
        customClass: {
          confirmButton: "sweet-btn-primary" // 确认按钮自定义样式类（用于自定义按钮外观）
        },
        ...options // 合并用户传入的配置（用户配置优先级高于默认配置）
      };

      try {
        // 调用SweetAlert2的fire方法，显示弹窗，并等待用户操作
        const result = await Swal.fire(defaultOptions);
        // 返回用户操作结果：result.isConfirmed为true表示点击了"确认"，false表示点击"取消"或关闭弹窗
        return result.isConfirmed;
      } catch (error) {
        // 捕获弹窗显示过程中的异常（如配置错误、库加载失败等）
        console.error("Swal 弹窗异常:", error);
        // 异常时返回false，避免影响后续业务逻辑
        return false;
      }
    };

    // 额外挂载$swal对象（直接暴露SweetAlert2实例），支持调用原生方法（如示例中的提示型弹窗）
    Vue.prototype.$swal = Swal;
  }
};

// 导出插件对象，供Vue项目入口文件导入并使用
export default swalPlugin;
