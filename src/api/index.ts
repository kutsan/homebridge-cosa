import axios from 'axios'

const API_BASE_URL = 'https://kiwi.cosa.com.tr/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})
