// Use localhost for development, VPS URL for production
const isDevelopment = process.env.NODE_ENV !== 'production' || window.location.hostname === 'localhost';

export const server = isDevelopment 
  ? "http://localhost:8000/api/v2" 
  : "https://www.mallofcayman.com/api/v2";

export const backend_url = isDevelopment 
  ? "http://localhost:8000/" 
  : "https://www.mallofcayman.com/api/";

// Add socket URL export for WebSocket connections
export const socket_url = isDevelopment 
  ? "http://localhost:4000" 
  : "https://www.mallofcayman.com";