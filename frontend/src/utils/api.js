import axios from 'axios'

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout:         30000,
  withCredentials: true, // send HTTP-only refresh cookie on every request
})

// Attach access token from localStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem('acadex_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue  = []

function processQueue(error, token = null) {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config

    // Attempt silent token refresh on 401 (but not on the refresh endpoint itself)
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry  = true
      isRefreshing     = true

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const newToken = data.token
        localStorage.setItem('acadex_token', newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        // Refresh failed — clear session and redirect to login
        localStorage.removeItem('acadex_token')
        localStorage.removeItem('acadex_user')
        window.dispatchEvent(new Event('auth:unauthorized'))
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    // 403 — forbidden (wrong role)
    if (err.response?.status === 403) {
      console.warn('[API] 403 Forbidden:', original?.url)
    }

    return Promise.reject(err)
  }
)

export default api
