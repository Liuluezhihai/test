module.exports = {
  lintOnSave: false,
  devServer: {
    host: "localhost",
    port: 21091,
    https: false,
    proxy: {
      // 匹配前端请求中以 "/api" 开头的路径（自定义前缀，方便区分代理请求）
      "/api": {
        target: "http://localhost:8080", // 后端服务地址（端口 8080，正确）
        changeOrigin: true, // 开启跨域代理（关键：解决本地跨域问题）
        pathRewrite: {
          // 路径重写：把前端请求的 "/api" 替换为后端的真实前缀 "/api/book-manage-sys-api/v1.0"
          "^/api": "/api"
        }
      }
    },
    overlay: {
      warning: false,
      errors: false
    }
  }
};
