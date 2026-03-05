import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例，配置后端接口基础地址！！！【修改为你的Java后端IP+端口】
const service = axios.create({
  baseURL: 'http://localhost:8080', // 后端地址，核心配置，必须改
  timeout: 5000,
  withCredentials: true // 允许携带cookie
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 为非FormData类型的请求自动设置Content-Type为application/json
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    // 在请求头中添加token
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : '';
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 检查后端返回的响应格式
    const { status, code, data, msg } = res.data;
    
    // 特殊处理：如果后端直接返回布尔值（如selectIfFollow接口）
    if (typeof res.data === 'boolean') {
      return { success: true, data: res.data };
    }
    
    // 后端约定：code=200 为成功
    if (code === 200 || status === 'success') {
      return { success: true, data };
    } else if (code === 401 || status === 'error' && code === 401) {
      // 未登录状态，清除本地存储的用户信息和token
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      ElMessage.error(msg || '登录已过期，请重新登录');
      // 跳转到登录页面（管理端页面不跳转）
      if (!window.location.pathname.startsWith('/admin/')) {
        window.location.href = '/';
      }
      return false;
    } else {
      ElMessage.error(msg || '操作失败');
      return false;
    }
  },
  (error) => {
    // 处理401错误（token过期）
    if (error.response && error.response.status === 401) {
      // 清除本地存储的用户信息和token
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      ElMessage.error('登录已过期，请重新登录');
      // 跳转到登录页面（管理端页面不跳转）
      if (!window.location.pathname.startsWith('/admin/')) {
        window.location.href = '/';
      }
      return false;
    }
    
    // 其他错误
    ElMessage.error('网络异常，请检查后端服务是否启动');
    if(error.config.errorCallback){
      error.config.errorCallback(); // 对应请求的errorCallback回调（验证码刷新）
    }
    return false;
  }
);

// 暴露请求方法，和你的proxy.Request调用方式一致
const Request = (options) => {
  const { url, params, data, method = 'get', headers } = options;
  if (method.toLowerCase() === 'get') {
    return service.get(url, { params, headers });
  } else {
    return service.post(url, data || params, { params, headers });
  }
};

export default Request;