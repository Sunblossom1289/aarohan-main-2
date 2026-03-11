export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://aarohan-iota.vercel.app';
export const APIBASEURL = API_BASE_URL;

const config = {
  apiUrl: API_BASE_URL,
  environment: import.meta.env.MODE || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};

if (typeof window !== 'undefined') {
  window.API_BASE_URL = API_BASE_URL;
  window.APIBASEURL = API_BASE_URL;
}

export { config };
