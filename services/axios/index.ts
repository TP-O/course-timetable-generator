import axios from 'axios'

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use(
  function (config) {
    const jwt = localStorage.getItem('jwt')

    if (jwt !== undefined) {
      config.headers!.Authorization = `Bearer ${jwt}`
    }

    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

axiosClient.interceptors.response.use(
  function (response) {
    return {
      data: response.data.data,
    }
  },
  function (error) {
    return {
      error: error.response.data.error || 'Unknown error!',
    }
  }
)

export { axiosClient }
