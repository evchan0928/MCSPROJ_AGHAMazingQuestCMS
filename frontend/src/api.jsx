// Small API helper: centralize API base and attach Authorization header when present.
// Always use Tailscale IP for all API requests
const API_BASE = 'http://100.93.255.84:8000';

function buildUrl(path) {
  if (!path) return API_BASE;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // ensure we don't duplicate slashes
  return `${API_BASE}${path}`;
}

export async function fetchAuth(path, options = {}) {
  const token = localStorage.getItem('access_token'); // Changed from 'access' to 'access_token' to match django-api.js
  const headers = Object.assign({}, options.headers || {});
  if (token && !headers.Authorization && !headers.authorization) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const url = buildUrl(path);
  return fetch(url, Object.assign({}, options, { headers }));
}

export { API_BASE };