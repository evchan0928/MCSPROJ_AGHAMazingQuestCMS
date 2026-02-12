// Django API integration for the frontend
import axios from 'axios';

// Initialize Django API client
// Prefer explicit env var `REACT_APP_BACKEND_API_URL`. If not provided,
// default to the project's Tailscale host used in development so the
// frontend can reach the proxied nginx/gunicorn stack.
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://100.93.255.84/api' || 'http://localhost:8000/api';

// Create an axios instance with default settings
const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 60000, // Increased timeout for report generation
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken'), // Get CSRF token from cookies
  },
});

// Allow sending cookies (CSRF token) for cross-origin requests when CORS_ALLOW_CREDENTIALS is enabled on the backend
apiClient.defaults.withCredentials = true;

// Helper function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Request interceptor to include CSRF token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-CSRFToken'] = getCookie('csrftoken');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${BACKEND_API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
            originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Get the API client instance
 */
export const getApiClient = () => {
  return apiClient;
};

/**
 * Sign in with username/email and password
 */
export const signInWithEmail = async (usernameOrEmail, password) => {
  try {
    // Note: Django backend expects 'username' field which can be either username or email
    const response = await apiClient.post('/auth/login/', {
      username: usernameOrEmail,  // Django backend expects 'username' field which can be either username or email
      password
    });

    if (response.data.access && response.data.refresh) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email, password, userData = {}) => {
  try {
    const response = await apiClient.post('/auth/register/', {
      email,
      password,
      ...userData
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    // Remove tokens from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Optionally notify the backend
    try {
      await apiClient.post('/auth/logout/');
    } catch (err) {
      // Ignore logout errors - just ensure local tokens are cleared
      console.log('Logout notification to backend failed (this is OK):', err);
    }
  } catch (error) {
    console.error('Error during sign out:', error);
    throw new Error(error.message);
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/user/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Get the current user profile
 */
export const getCurrentUserProfile = async () => {
  try {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Get content items
 */
export const getContentItems = async () => {
  try {
    const response = await apiClient.get('/content/items/');
    // Support both paginated responses (e.g. { results: [...] })
    // and direct array responses. This avoids frontend errors when
    // the backend uses DRF pagination.
    if (response && response.data) {
      // If paginated, return the results array, otherwise return data as-is
      return Array.isArray(response.data) ? response.data : (response.data.results || response.data);
    }
    return [];
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/dashboard/stats/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Get recent content items
 */
export const getRecentContent = async () => {
  try {
    const response = await apiClient.get('/content/recent/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Create a new content item
 */
export const createContentItem = async (data) => {
  try {
    const formData = new FormData();
    
    // Map the frontend field names to backend field names
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        // Convert boolean values to strings as Django expects
        if (typeof data[key] === 'boolean') {
          formData.append(key, data[key].toString());
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    
    const response = await apiClient.post('/content/items/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Update a content item
 */
export const updateContentItem = async (id, data) => {
  try {
    const response = await apiClient.patch(`/content/items/${id}/`, data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Delete a content item
 */
export const deleteContentItem = async (id) => {
  try {
    const response = await apiClient.delete(`/content/items/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Send content item for approval
 */
export const sendContentForApproval = async (id) => {
  try {
    const response = await apiClient.post(`/content/items/${id}/send_for_approval/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Approve content item
 */
export const approveContentItem = async (id) => {
  try {
    const response = await apiClient.post(`/content/items/${id}/approve/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Deny content item
 */
export const denyContentItem = async (id) => {
  try {
    const response = await apiClient.post(`/content/items/${id}/deny/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Publish content item
 */
export const publishContentItem = async (id) => {
  try {
    const response = await apiClient.post(`/content/items/${id}/publish/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Get all users
 */
export const getUsers = async () => {
  try {
    const response = await apiClient.get('/users/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
  try {
    const response = await apiClient.get(`/users/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Create a new user
 */
export const createUser = async (userData) => {
  try {
    const response = await apiClient.post('/users/', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Update a user
 */
export const updateUser = async (id, userData) => {
  try {
    const response = await apiClient.patch(`/users/${id}/`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (id) => {
  try {
    const response = await apiClient.delete(`/users/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Get all roles
 */
export const getRoles = async () => {
  try {
    const response = await apiClient.get('/users/roles/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Create a new role
 */
export const createRole = async (roleData) => {
  try {
    const response = await apiClient.post('/users/roles/create/', roleData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Update a role
 */
export const updateRole = async (id, roleData) => {
  try {
    const response = await apiClient.put(`/users/roles/${id}/`, roleData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Delete a role
 */
export const deleteRole = async (id) => {
  try {
    const response = await apiClient.delete(`/users/roles/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Get analytics summary
 */
export const getAnalyticsSummary = async () => {
  try {
    const response = await apiClient.get('/analytics/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Get content analytics
 */
export const getContentAnalytics = async () => {
  try {
    const response = await apiClient.get('/analytics/content/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Get user activity analytics
 */
export const getUserActivityAnalytics = async () => {
  try {
    const response = await apiClient.get('/analytics/users/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Generate analytics report
 */
export const generateAnalyticsReport = async (params) => {
  try {
    const response = await apiClient.post('/analytics/generate/', params);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Download analytics report
 */
export const downloadAnalyticsReport = async (params) => {
  try {
    const response = await apiClient.post('/analytics/download/', params, {
      responseType: 'blob', // Important for file downloads
      timeout: 120000 // Extended timeout for report generation
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/* ------------------ Mobile management API helpers ------------------ */

export const getMobileProfiles = async () => {
  try {
    const response = await apiClient.get('/users/mobile/profile/');
    return Array.isArray(response.data) ? response.data : (response.data.results || response.data);
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const getMobileScores = async () => {
  try {
    const response = await apiClient.get('/users/mobile/score/');
    return Array.isArray(response.data) ? response.data : (response.data.results || response.data);
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const postMobileScore = async (payload) => {
  try {
    const response = await apiClient.post('/users/mobile/score/', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const getMobileLeaderboard = async () => {
  try {
    const response = await apiClient.get('/users/mobile/leaderboard/');
    return Array.isArray(response.data) ? response.data : (response.data.results || response.data);
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const getMobileBadges = async () => {
  try {
    const response = await apiClient.get('/users/mobile/badges/');
    return Array.isArray(response.data) ? response.data : (response.data.results || response.data);
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const getMobileSessions = async () => {
  try {
    const response = await apiClient.get('/users/mobile/session/');
    return Array.isArray(response.data) ? response.data : (response.data.results || response.data);
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const getMobileOtps = async () => {
  try {
    const response = await apiClient.get('/users/mobile/otp/');
    return Array.isArray(response.data) ? response.data : (response.data.results || response.data);
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};
