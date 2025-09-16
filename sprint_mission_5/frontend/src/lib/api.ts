import axios from 'axios';

// 환경별 API URL 설정
const getApiBaseUrl = () => {
  // 환경 변수가 있으면 우선 사용
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // 클라이언트 사이드에서 hostname 확인
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    // 프로덕션 환경 (Vercel)
    return 'https://sprint-mission-id8i.onrender.com';
  }

  // 서버 사이드에서는 프로덕션 URL 사용
  return 'https://sprint-mission-id8i.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 (토큰 만료 시 자동 갱신)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/users/refresh-token`, {
          refreshToken,
        });
        
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; nickname: string; password: string }) =>
    api.post('/users/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/users/login', data),
  
  getProfile: () =>
    api.get('/users/me'),
  
  updateProfile: (data: { nickname?: string; image?: string }) =>
    api.patch('/users/me', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/users/me/password', data),
  
  getMyProducts: () =>
    api.get('/users/me/products'),
  
  getMyLikedProducts: () =>
    api.get('/users/me/liked-products'),
  
  getMyArticles: () =>
    api.get('/users/me/articles'),
};

// Product API
export const productAPI = {
  getAll: (params?: { offset?: number; limit?: number; search?: string; sort?: string }) =>
    api.get('/products', { params }),
  
  getById: (id: number) =>
    api.get(`/products/${id}`),
  
  create: (data: { name: string; description: string; price: number; tags: string[]; imageUrl?: string }) =>
    api.post('/products', data),
  
  update: (id: number, data: Partial<{ name: string; description: string; price: number; tags: string[]; imageUrl?: string }>) =>
    api.patch(`/products/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/products/${id}`),
  
  toggleLike: (id: number) =>
    api.post(`/products/${id}/like`),
};

// Article API
export const articleAPI = {
  getAll: (params?: { offset?: number; limit?: number; search?: string; sort?: string }) =>
    api.get('/articles', { params }),
  
  getById: (id: number) =>
    api.get(`/articles/${id}`),
  
  create: (data: { title: string; content: string }) =>
    api.post('/articles', data),
  
  update: (id: number, data: Partial<{ title: string; content: string }>) =>
    api.patch(`/articles/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/articles/${id}`),
  
  toggleLike: (id: number) =>
    api.post(`/articles/${id}/like`),
};

// Comment API
export const commentAPI = {
  createForProduct: (productId: number, data: { content: string }) =>
    api.post(`/comments/product/${productId}`, data),
  
  createForArticle: (articleId: number, data: { content: string }) =>
    api.post(`/comments/article/${articleId}`, data),
  
  getForProduct: (productId: number) =>
    api.get(`/comments/product/${productId}`),
  
  getForArticle: (articleId: number) =>
    api.get(`/comments/article/${articleId}`),
  
  update: (id: number, data: { content: string }) =>
    api.patch(`/comments/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/comments/${id}`),
};