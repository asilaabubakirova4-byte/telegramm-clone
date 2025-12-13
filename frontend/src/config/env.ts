export const config = {
  API_URL: import.meta.env.VITE_API_URL || '/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || window.location.origin,
  NODE_ENV: import.meta.env.MODE || 'development'
}