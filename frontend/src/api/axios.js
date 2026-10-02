import axios from 'axios'

const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const apiBaseUrl = apiHost.startsWith('http') ? apiHost : `https://${apiHost}`

const api = axios.create({
  baseURL: `${apiBaseUrl.replace(/\/+$/, '')}/api`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
