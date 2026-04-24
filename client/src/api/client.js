const BASE = '/api';

function getToken() {
  return localStorage.getItem('am_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Fehler beim API-Aufruf');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  auth: {
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/auth/me'),
    updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
    changePassword: (body) => request('/auth/password', { method: 'PUT', body: JSON.stringify(body) })
  },
  catches: {
    list: () => request('/catches'),
    get: (id) => request(`/catches/${id}`),
    create: (body) => request('/catches', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/catches/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/catches/${id}`, { method: 'DELETE' })
  },
  spots: {
    list: () => request('/spots'),
    get: (id) => request(`/spots/${id}`),
    create: (body) => request('/spots', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/spots/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/spots/${id}`, { method: 'DELETE' })
  },
  stats: {
    overview: () => request('/stats/overview')
  },
  forecast: {
    today: (params) => request(`/forecast/today?${new URLSearchParams(params)}`)
  },
  community: {
    feed: (page = 1) => request(`/community/feed?page=${page}&limit=20`),
    getComments: (catchId) => request(`/community/${catchId}/comments`),
    addComment: (catchId, text) => request(`/community/${catchId}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),
    deleteComment: (commentId) => request(`/community/comments/${commentId}`, { method: 'DELETE' }),
    toggleLike: (catchId) => request(`/community/${catchId}/like`, { method: 'POST' })
  },
  reports: {
    submit: (body) => request('/reports', { method: 'POST', body: JSON.stringify(body) })
  },
  admin: {
    getReports:    ()   => request('/admin/reports'),
    resolveReport: (id) => request(`/admin/reports/${id}/resolve`, { method: 'PATCH' }),
    deleteReport:  (id) => request(`/admin/reports/${id}`, { method: 'DELETE' }),
    getUsers:       ()            => request('/admin/users'),
    setUserStatus:  (id, status)  => request(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    updateUserRole: (id, role)    => request(`/admin/users/${id}/role`,   { method: 'PATCH', body: JSON.stringify({ role }) }),
    deleteUser:     (id)          => request(`/admin/users/${id}`,        { method: 'DELETE' })
  },
  leaderboard: {
    get: (scope = 'national', metric = 'catches') =>
      request(`/leaderboard?scope=${scope}&metric=${metric}&limit=10`)
  },
  cotw: {
    current: () => request('/cotw/current'),
    vote: (catchId) => request(`/cotw/vote/${catchId}`, { method: 'POST' }),
    history: () => request('/cotw/history')
  },
  ai: {
    identifyFish: (imageBase64, mimeType) =>
      request('/ai/identify-fish', { method: 'POST', body: JSON.stringify({ imageBase64, mimeType }) }),
    analyzeForecast: (weather, location) =>
      request('/ai/analyze-forecast', { method: 'POST', body: JSON.stringify({ weather, location }) })
  }
};
