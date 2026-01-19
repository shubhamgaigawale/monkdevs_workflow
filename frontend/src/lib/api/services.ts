import axios from 'axios'

// Use API Gateway for all services
const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const createServiceAPI = () => {
  const instance = axios.create({
    baseURL: API_GATEWAY_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor: Add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor: Handle 401
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// Create single API instance for all services (via API Gateway)
const api = createServiceAPI()

export const userServiceAPI = api
export const leadServiceAPI = api
export const callServiceAPI = api
export const campaignServiceAPI = api
export const integrationServiceAPI = api
export const hrServiceAPI = api
export const notificationServiceAPI = api
export const billingServiceAPI = api
export const reportingServiceAPI = api
export const customerAdminServiceAPI = api

// Default export for new services
export default api
