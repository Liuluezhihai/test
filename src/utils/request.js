// 导入axios库（用于发送HTTP请求的核心库）
import axios from "axios";
// 导入获取本地存储token的工具函数（用于携带登录凭证）
import { getToken } from "@/utils/storage.js";

// 定义API基础路径：后端接口的统一前缀（避免重复编写完整URL）
const URL_API = "http://localhost:8080/api";

// 创建axios实例：配置基础路径和超时时间，统一管理请求设置
const request = axios.create({
  baseURL: URL_API, // 请求基础路径，所有通过该实例发送的请求都会自动拼接该前缀
  timeout: 8000 // 请求超时时间：8秒内未收到响应则判定为请求失败
});
axios.defaults.timeout = 30000;
// 请求拦截器：在每个请求发送到后端之前执行（用于统一添加请求头、处理请求参数等）
request.interceptors.request.use(
  // 成功回调：请求发送前的处理逻辑
  config => {
    // 从本地存储中获取token（登录成功后存储的身份认证凭证）
    const token = getToken();
    // 若token存在，将其添加到请求头的"token"字段中（供后端验证用户身份）
    if (token !== null) {
      config.headers["token"] = token;
    }
    // 返回处理后的配置对象，axios会使用该配置发送请求
    return config;
  },
  // 失败回调：请求发送前发生错误时的处理逻辑
  error => {
    // 将错误包装为Promise拒绝状态并返回，供调用者捕获处理
    return Promise.reject(error);
  }
);

// 导出axios实例：供项目中其他文件导入使用，统一发送HTTP请求
export default request;
