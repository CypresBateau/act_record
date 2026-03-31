import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 防止并发401请求导致多次跳转
let isRefreshing = false;
let lastRateLimitWarning = 0;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 处理429限流错误
    if (error.response?.status === 429) {
      // 避免频繁弹窗，限制为每30秒最多一次警告
      const now = Date.now();
      if (now - lastRateLimitWarning > 30000) {
        console.warn('请求过于频繁，请稍后再试');
        lastRateLimitWarning = now;
      }
      // 返回友好的错误信息
      error.message = '请求过于频繁，请稍后再试';
    }

    // 处理401未授权错误
    if (error.response?.status === 401) {
      // 避免并发请求导致的多次token删除和跳转
      if (!isRefreshing) {
        isRefreshing = true;
        localStorage.removeItem('token');

        // 延迟跳转，给正在进行的请求一些时间完成
        setTimeout(() => {
          window.location.href = '/login';
          isRefreshing = false;
        }, 100);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verify: () => api.get('/auth/verify'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
};

export const activityService = {
  getActivities: (params) => api.get('/activities', { params }),
  getActivity: (id) => api.get(`/activities/${id}`),
  createActivity: (activityData) => api.post('/activities', activityData),
  updateActivity: (id, activityData) => api.put(`/activities/${id}`, activityData),
  deleteActivity: (id) => api.delete(`/activities/${id}`),
  getStats: () => api.get('/activities/stats/overview'),

  addExpense: (activityId, expenseData) => api.post(`/activities/${activityId}/expenses`, expenseData),
  updateExpense: (activityId, expenseId, expenseData) => api.put(`/activities/${activityId}/expenses/${expenseId}`, expenseData),
  deleteExpense: (activityId, expenseId) => api.delete(`/activities/${activityId}/expenses/${expenseId}`),
};

export const fileService = {
  uploadFile: (activityId, fileData) => {
    const formData = new FormData();
    formData.append('file', fileData.file);
    formData.append('category', fileData.category);
    if (fileData.description) {
      formData.append('description', fileData.description);
    }

    return api.post(`/files/upload/${activityId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadMultipleFiles: (activityId, filesData) => {
    const formData = new FormData();
    filesData.files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('category', filesData.category);
    if (filesData.description) {
      formData.append('description', filesData.description);
    }

    return api.post(`/files/upload-multiple/${activityId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getFiles: (activityId, category) => {
    const params = category ? { category } : {};
    return api.get(`/files/${activityId}`, { params });
  },

  downloadFile: (activityId, fileId) => api.get(`/files/download/${activityId}/${fileId}`, {
    responseType: 'blob',
  }),

  updateFile: (activityId, fileId, fileData) => api.put(`/files/${activityId}/${fileId}`, fileData),
  deleteFile: (activityId, fileId) => api.delete(`/files/${activityId}/${fileId}`),
};

export const userService = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  toggleUserStatus: (id) => api.put(`/users/${id}/toggle-status`),
  resetPassword: (id, passwordData) => api.put(`/users/${id}/reset-password`, passwordData),
  getStats: () => api.get('/users/stats/overview'),
};

export const DEPARTMENTS = ['学术部', '办公室', '实践部', '文体部', '宣传部'];
export const ROLES = ['主席', '部长', '部员'];
export const ACTIVITY_STATUS = ['计划中', '进行中', '已完成', '已取消'];
export const ACTIVITY_FORMATS = ['线上', '线下', '线上线下结合'];
export const FILE_CATEGORIES = ['活动文件', '宣传文案', '照片记录', '报销凭证'];
export const EXPENSE_CATEGORIES = ['场地费', '物料费', '人员费', '交通费', '其他'];

export default api;