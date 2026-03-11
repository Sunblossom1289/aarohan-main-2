import axios from 'axios';
import { API_BASE_URL } from "../utils/config";

// --- PART 1: The New Axios Instance (For Sessions) ---
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add Token (Required for the new Session logic)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Uses the token we set up earlier
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('aarohan_user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// --- PART 2: Your Legacy Fetch Helper ---
const API_URL = API_BASE_URL;

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  return response.json();
}

// --- PART 3: Exports ---

// Export the Axios instance for the new Session Components
export { api }; 

// Your Existing Exports (Preserved)
export const authAPI = {
  studentLogin: (phone) =>
    apiCall('/auth/studentlogin', { method: 'POST', body: JSON.stringify({ phone }) }),
  counselorLogin: (phone) =>
    apiCall('/auth/counselorlogin', { method: 'POST', body: JSON.stringify({ phone }) }),
  adminLogin: (phone) =>
    apiCall('/auth/adminlogin', { method: 'POST', body: JSON.stringify({ phone }) })
};

export const studentAPI = {
  getAll: () => apiCall('/students'),
  getById: (id) => apiCall(`/students/${id}`),
  updateProfile: (id, data) =>
    apiCall(`/students/${id}/profile`, { method: 'PUT', body: JSON.stringify(data) }),
  updateTest: (id, testType, data) =>
    apiCall(`/students/${id}/test/${testType}`, { method: 'PUT', body: JSON.stringify(data) }),
  assignCounselor: (id, counselorId) =>
    apiCall(`/students/${id}/assign-counselor`, { method: 'PUT', body: JSON.stringify({ counselorId }) }),
  upgradeProgram: (id, program, counselingCredits, testCredits) =>
    apiCall(`/students/${id}/upgrade`, { method: 'PUT', body: JSON.stringify({ program, counselingCredits, testCredits }) })
};

export const counselorAPI = {
  getAll: () => apiCall('/counselors'),
  getById: (id) => apiCall(`/counselors/${id}`),
  updateProfile: (id, data) =>
    apiCall(`/counselors/${id}/profile`, { method: 'PUT', body: JSON.stringify(data) }),
  updateVerification: (id, status) =>
    apiCall(`/counselors/${id}/verify`, { method: 'PUT', body: JSON.stringify({ status }) }),
  setAdminAccess: (id, hasAccess) =>
    apiCall(`/counselors/${id}/admin-access`, { method: 'PUT', body: JSON.stringify({ hasAdminAccess: hasAccess }) }),
  changePassword: (id, currentPassword, newPassword) =>
    apiCall(`/counselors/${id}/change-password`, { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
  updateAuth: (id, data) =>
    apiCall(`/counselors/${id}/update-auth`, { method: 'PUT', body: JSON.stringify(data) })
};

export const sessionAPI = {
  getAll: () => apiCall('/sessions'),
  getByCounselor: (counselorId) => apiCall(`/sessions/counselor/${counselorId}`),
  getByStudent: (studentId) => apiCall(`/sessions/student/${studentId}`),
  book: (data) =>
    apiCall('/sessions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    apiCall(`/sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};

export const testAPI = {
  completeTest: (studentId, testType, data) =>
    apiCall(`/students/${studentId}/test/${testType}/complete`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

export const supportAPI = {
  submit: (data) =>
    apiCall('/support/submit', { method: 'POST', body: JSON.stringify(data) }),
};

// Default export for flexibility
export default api;
