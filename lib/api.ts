const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const notesApi = {
  getUserNotes: async (userId: string, page = 1) => {
    const res = await fetch(`${API_URL}/api/notes/user/${userId}?page=${page}`, { headers: getHeaders() });
    return res.json();
  },
  delete: async (noteId: string) => {
    const res = await fetch(`${API_URL}/api/notes/${noteId}`, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },
};

export const searchApi = {
  global: async (query: string, filters?: Record<string, string>) => {
    const params = new URLSearchParams({ q: query, ...filters });
    const res = await fetch(`${API_URL}/api/search?${params}`, { headers: getHeaders() });
    return res.json();
  },
};

export const groupsApi = {
  getAll: async (page = 1) => {
    const res = await fetch(`${API_URL}/api/groups?page=${page}`, { headers: getHeaders() });
    return res.json();
  },
};

export const adminApi = {
  getStats: async () => {
    const res = await fetch(`${API_URL}/api/admin/stats`, { headers: getHeaders() });
    return res.json();
  },
};
