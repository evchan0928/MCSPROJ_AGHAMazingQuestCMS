// Django API integration for the frontend
import axios from 'axios';

// Initialize Django API client
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://127.0.0.1:8000/api';

// Create an axios instance with default settings
const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 60000, // Increased timeout for report generation
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken'), // Get CSRF token from cookies
  },
});

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
    const token = localStorage.getItem('access');
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

// Response interceptor to handle token refresh and authentication failures
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      // If this is not a retry attempt
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh');
          if (refreshToken) {
            // Use the same BACKEND_API_URL for token refresh
            const response = await axios.post(`${BACKEND_API_URL}/token/refresh/`, {
              refresh: refreshToken,
            });
            
            if (response.data.access) {
              // Update tokens and retry the original request
              localStorage.setItem('access', response.data.access);
              localStorage.setItem('refresh', response.data.refresh);
              apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
              originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
              return apiClient(originalRequest);
            }
          }
        } catch (refreshError) {
          // Token refresh failed
          console.error('Token refresh failed:', refreshError);
        }
      }
      
      // If we get here, either it was a retry attempt or token refresh failed
      // Clear tokens and redirect to login
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      
      // Redirect to login page
      window.location.href = '/signin';
      return Promise.reject(new Error('Authentication failed - redirected to login'));
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      // For forbidden errors, you might want to redirect to a different page
      console.error('Forbidden access:', error);
      // Optionally redirect to an access denied page
      // window.location.href = '/access-denied';
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
export const signInWithEmail = async (username, password) => {
  try {
    const response = await apiClient.post('/auth/login/', {
      username,  // Changed from 'email' to 'username' to support both username and email
      password
    });

    if (response.data.access && response.data.refresh) {
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
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
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    
    // Optionally notify the backend
    try {
      await apiClient.post('/auth/logout/');
    } catch (err) {
      // Ignore logout errors
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me/');  // Changed from /auth/user/ to /auth/me/
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
    const response = await apiClient.get('/users/dashboard/stats/');  // Updated to use the correct endpoint
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

/**
 * Get recent content items with optional filters
 */
export const getFilteredContent = async (filters = {}) => {
  try {
    // Build query parameters from filters
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) {
      queryParams.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('end_date', filters.endDate);
    }
    
    if (filters.contentType) {
      queryParams.append('content_type', filters.contentType);
    }
    
    // Add pagination if needed
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    if (filters.pageSize) {
      queryParams.append('page_size', filters.pageSize);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/users/content/recent/?${queryString}` : '/users/content/recent/';
    
    const response = await apiClient.get(url);
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