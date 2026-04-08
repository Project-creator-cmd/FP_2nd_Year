import axios from 'axios'

const MAX_RETRIES = 2;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('acadex_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  
  // Debug Log
  if (import.meta.env.DEV) {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
  }
  return config
})

api.interceptors.response.use(
  res => {
    if (import.meta.env.DEV) {
      console.log(`[API Success] ${res.config.url}`, res.data);
    }
    return res;
  },
  async err => {
    const originalRequest = err.config;

    // Add Fallback/Retry Logic for Network Errors or 5xx Server Errors (not 4xx errors)
    if (!originalRequest || ((!err.response || err.response.status >= 500) && !originalRequest._retryCount)) {
      originalRequest._retryCount = 0;
    }
    
    if (originalRequest && originalRequest._retryCount < MAX_RETRIES && (!err.response || err.response.status >= 500 || err.response.status === 429)) {
      originalRequest._retryCount += 1;
      console.warn(`[API Retry] Retrying request ${originalRequest.url} (${originalRequest._retryCount}/${MAX_RETRIES})`);
      // Wait for a backoff duration before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount));
      return api(originalRequest);
    }

    // Standard Error Handling
    if (err.response) {
      console.error(`[API Error] ${err.response.status} at ${originalRequest?.url}`, err.response.data);
      
      if (err.response.status === 401 || err.response.status === 403) {
        // Unauthorized or Forbidden - token expired or invalid
        localStorage.removeItem('acadex_token')
        localStorage.removeItem('acadex_user')
        if (window.location.pathname !== '/login') {
          window.dispatchEvent(new Event('auth:unauthorized'))
        }
      }
    } else {
      console.error(`[API Network Error] at ${originalRequest?.url}:`, err.message);
    }

    return Promise.reject(err)
  }
)

export default api
