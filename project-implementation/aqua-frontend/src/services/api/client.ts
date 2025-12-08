import axios, { type AxiosError, type AxiosResponse } from 'axios'

// Create axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// .NET API client for audio operations (uses Vite proxy to avoid CORS)
export const audioApiClient = axios.create({
  baseURL: import.meta.env.VITE_AUDIO_API_URL || '/audio-api',
  timeout: 60000, // Increased for large file uploads
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = sessionStorage.getItem('aqua-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      sessionStorage.removeItem('aqua-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Same interceptors for audio client
audioApiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('aqua-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for audio client
audioApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('aqua-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
