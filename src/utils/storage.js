// 定义本地存储的key常量：统一管理key值，避免硬编码错误，便于后续维护
const TOKEN_KEY = "token"; // 存储用户身份认证token的key

const ACTIVE_PATH = "active_key"; // 存储当前激活路由路径的key

/**
 * 获取用户身份认证token
 * @returns {string|null} - 存储的token字符串（未存储则返回null）
 */
export function getToken() {
  // 从sessionStorage中获取token（sessionStorage：会话级存储，页面关闭后数据消失）
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * 存储用户身份认证token
 * @param {string} token - 要存储的token字符串（登录成功后后端返回的凭证）
 */
export function setToken(token) {
  // 将token存储到sessionStorage中，key为TOKEN_KEY
  sessionStorage.setItem(TOKEN_KEY, token);
}


/**
 * 清除所有sessionStorage存储的数据（退出登录时使用）
 * 说明：清除的是整个sessionStorage，包括token、健康信息、激活路径等所有存储内容
 */
export function clearToken() {
  sessionStorage.clear();
}

/**
 * 获取当前激活的路由路径（用于页面刷新后恢复之前的路由状态）
 * @returns {string|null} - 存储的路由路径字符串（未存储则返回null）
 */
export function getActivePath() {
  // 从sessionStorage中获取激活路径
  return sessionStorage.getItem(ACTIVE_PATH);
}

/**
 * 存储当前激活的路由路径
 * @param {string} path - 要存储的路由路径（如"/adminLayout"、"/user/list"）
 */
export function setActivePath(path) {
  // 将路由路径存储到sessionStorage中，key为ACTIVE_PATH
  sessionStorage.setItem(ACTIVE_PATH, path);
}
