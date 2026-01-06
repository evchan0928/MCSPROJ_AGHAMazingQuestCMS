// Small API helper: centralize API base and attach Authorization header when present.
const API_BASE = process.env.REACT_APP_API_URL || ((window.location.hostname === 'localhost' && window.location.port === '3000') ? 'http://localhost:8000' : '');

function buildUrl(path) {
  if (!path) return API_BASE;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // ensure we don't duplicate slashes
  return `${API_BASE}${path}`;
}

export async function fetchAuth(path, options = {}) {
  const token = localStorage.getItem('access');
  const headers = Object.assign({}, options.headers || {});
  if (token && !headers.Authorization && !headers.authorization) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const url = buildUrl(path);
  return fetch(url, Object.assign({}, options, { headers }));
}

export { API_BASE };
