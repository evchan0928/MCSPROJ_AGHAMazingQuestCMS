// Django API integration for the frontend
import axios from 'axios';

// Initialize Django API client
// Always use Tailscale IP for all API requests
const getBackendURL = () => {
  // Always route through Tailscale IP
  return 'http://100.93.255.84:8000';
};

const BACKEND_BASE_URL = getBackendURL();
const BACKEND_API_URL = BACKEND_BASE_URL.endsWith('/api') ? BACKEND_BASE_URL : `${BACKEND_BASE_URL}/api`;

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
        window.location.href = '/signin';
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
 * Get a single content item by ID
 */
export const getContentItemById = async (id) => {
  try {
    const response = await apiClient.get(`/content/items/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    // Updated URL to match backend configuration: /api/users/dashboard/stats/
    const response = await apiClient.get('/users/dashboard/stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default values in case of error
    return {
      published: 0,
      pendingApproval: 0,
      activeUsers: 0,
      notifications: 0,
      totalContent: 0,
      contentInEditing: 0,
      recentlyPublished: 0
    };
  }
};

/**
 * Get recent content items
 */
export const getRecentContent = async () => {
  try {
    // Updated URL to match backend configuration: /api/users/content/recent/
    const response = await apiClient.get('/users/content/recent/');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent content:', error);
    return [];
  }
};

/**
 * Create a new content item
 */
export const createContentItem = async (data) => {
  try {
    let payload;
    let headers = {
      'Content-Type': 'multipart/form-data',
    };

    // If `data` is already a FormData instance (UploadContentPage passes FormData),
    // send it as-is. Otherwise build a FormData from the plain object.
    if (data instanceof FormData) {
      payload = data;
    } else {
      const formData = new FormData();
      // Map the frontend field names to backend field names
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          // Handle special cases for data types
          if (key === 'quiz_correct_answers' && typeof data[key] === 'object') {
            formData.append(key, JSON.stringify(data[key]));
          } else if (key === 'quiz_questions' && typeof data[key] === 'object') {
            formData.append(key, JSON.stringify(data[key]));
          } else if (typeof data[key] === 'boolean') {
            formData.append(key, data[key].toString());
          } else {
            formData.append(key, data[key]);
          }
        }
      });
      payload = formData;
    }

    const response = await apiClient.post('/content/items/', payload, {
      headers
    });
    
    return response.data;
  } catch (error) {
    console.error("API Error Details:", error.response);
    // Provide more detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
      // Try to extract the most descriptive error message
      let errorMessage = 'Unknown error occurred';
      if (error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data && typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.statusText) {
        errorMessage = `${error.response.status} - ${error.response.statusText}`;
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request details:', error.request);
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      throw new Error(error.message);
    }
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
    const errorData = error.response?.data;
    if (errorData && typeof errorData === 'object') {
      if (errorData.error) {
        throw new Error(errorData.error);
      }
      if (Object.keys(errorData).length > 0) {
        const messages = Object.values(errorData).flat().join(', ');
        throw new Error(messages || 'Validation error occurred');
      }
    }
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Update a user
 */
export const updateUser = async (id, userData) => {
  try {
    // Check if updating current user by checking if id is 'current' or 'me'
    if (id === 'current' || id === 'me') {
      // If updating current user, use the profile endpoint
      const response = await apiClient.patch('/auth/me/', userData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } else {
      // Otherwise use the regular user endpoint
      const response = await apiClient.patch(`/users/${id}/`, userData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    }
  } catch (error) {
    // Handle both standard API error responses and backend validation errors
    const errorData = error.response?.data;
    if (errorData && typeof errorData === 'object') {
      // Check if it's a field-specific error object
      if (Object.keys(errorData).length > 0) {
        // Join multiple error messages if present
        const messages = Object.values(errorData).flat().join(', ');
        return Promise.reject(new Error(messages || 'Validation error occurred'));
      }
    }
    // Fallback to detail field or generic error message
    throw new Error(error.response?.data?.detail || error.response?.data?.error || error.message);
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
  const response = await apiClient.post('/analytics/download/', params, {
    responseType: 'blob', // Important for handling file downloads
  });
  return response.data;
};

// New API functions for engagement metrics
export const getContentEngagementMetrics = async () => {
  const response = await apiClient.get('/analytics/engagement/');
  return response.data;
};

export const getViewsOverTime = async () => {
  const response = await apiClient.get('/analytics/views-over-time/');
  return response.data;
};

// 🔑 NEW: Mobile Management API functions
export const getMobileStatistics = async () => {
  const response = await apiClient.get('/mobile/stats/');
  return response.data;
};

export async function getUserProfiles(params = {}) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${BACKEND_API_URL}/mobile/user-profiles/?${new URLSearchParams(params)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function createUserProfile(userData) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${BACKEND_API_URL}/mobile/user-profiles/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function updateUserProfile(profileId, userData) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${BACKEND_API_URL}/mobile/user-profiles/${profileId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function deleteUserProfile(profileId) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${BACKEND_API_URL}/mobile/user-profiles/${profileId}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function getUserSessions(params = {}) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${BACKEND_API_URL}/mobile/user-sessions/?${new URLSearchParams(params)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function getScores(params = {}) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${BACKEND_API_URL}/mobile/scores/?${new URLSearchParams(params)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function getBadges(params = {}) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${BACKEND_API_URL}/mobile/badges/?${new URLSearchParams(params)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function getUserBadges(params = {}) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${BACKEND_API_URL}/mobile/user-badges/?${new URLSearchParams(params)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function getLeaderboards(params = {}) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${BACKEND_API_URL}/mobile/leaderboards/?${new URLSearchParams(params)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}