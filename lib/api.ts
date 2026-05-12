const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  [key: string]: any;
}

class ApiClient {
  private baseUrl: string;
  constructor(baseUrl: string) { this.baseUrl = baseUrl; }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, { method: 'GET', headers: this.getHeaders() });
    return this.handleResponse<T>(response);
  }

  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, { method: 'POST', headers: this.getHeaders(), body: body ? JSON.stringify(body) : undefined });
    return this.handleResponse<T>(response);
  }

  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, { method: 'PUT', headers: this.getHeaders(), body: body ? JSON.stringify(body) : undefined });
    return this.handleResponse<T>(response);
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, { method: 'DELETE', headers: this.getHeaders() });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(API_URL);

export const authApi = {
  signup:         (data: any)             => apiClient.post('/auth/signup', data),
  login:          (data: any)             => apiClient.post('/auth/login', data),
  getCurrentUser: ()                      => apiClient.get('/auth/me'),
  updateProfile:  (data: any)             => apiClient.put('/auth/profile', data),
  getUserById:    (id: string)            => apiClient.get(`/auth/user/${id}`),
  followUser:     (id: string)            => apiClient.post(`/auth/follow/${id}`),
  unfollowUser:   (id: string)            => apiClient.post(`/auth/unfollow/${id}`),
};

export const notesApi = {
  getAll:       (page = 1, limit = 10)            => apiClient.get(`/notes?page=${page}&limit=${limit}`),
  getById:      (id: string)                      => apiClient.get(`/notes/${id}`),
  getBySubject: (subject: string, page = 1)       => apiClient.get(`/notes/subject/${subject}?page=${page}`),
  getUserNotes: (userId: string, page = 1)        => apiClient.get(`/notes/user/${userId}?page=${page}`),
  create:       (data: any)                       => apiClient.post('/notes', data),
  update:       (id: string, data: any)           => apiClient.put(`/notes/${id}`, data),
  delete:       (id: string)                      => apiClient.delete(`/notes/${id}`),
  like:         (id: string)                      => apiClient.post(`/notes/${id}/like`),
  unlike:       (id: string)                      => apiClient.post(`/notes/${id}/unlike`),
  addComment:   (id: string, data: any)           => apiClient.post(`/notes/${id}/comments`, data),
  download:     (id: string)                      => apiClient.post(`/notes/${id}/download`),
};

export const groupsApi = {
  getAll:        (page = 1)                        => apiClient.get(`/groups?page=${page}`),
  getById:       (id: string)                      => apiClient.get(`/groups/${id}`),
  getGroupNotes: (id: string, page = 1)            => apiClient.get(`/groups/${id}/notes?page=${page}`),
  getUserGroups: (userId: string, page = 1)        => apiClient.get(`/groups/user/${userId}?page=${page}`),
  create:        (data: any)                       => apiClient.post('/groups', data),
  update:        (id: string, data: any)           => apiClient.put(`/groups/${id}`, data),
  delete:        (id: string)                      => apiClient.delete(`/groups/${id}`),
  join:          (id: string)                      => apiClient.post(`/groups/${id}/join`),
  leave:         (id: string)                      => apiClient.post(`/groups/${id}/leave`),
  addNote:       (groupId: string, noteId: string) => apiClient.post(`/groups/${groupId}/notes/${noteId}`),
};

export const searchApi = {
  global:          (q: string, type = 'all', page = 1) => apiClient.get(`/search?q=${encodeURIComponent(q)}&type=${type}&page=${page}`),
  advanced:        (params: Record<string, any>)        => apiClient.get(`/search/notes/advanced?${new URLSearchParams(params).toString()}`),
  trending:        (limit = 10)                         => apiClient.get(`/search/trending?limit=${limit}`),
  topAuthors:      (limit = 10)                         => apiClient.get(`/search/top-authors?limit=${limit}`),
  popularSubjects: ()                                   => apiClient.get('/search/popular-subjects'),
};

export const adminApi = {
  getStats:        ()                              => apiClient.get('/admin/stats'),
  getAllUsers:      (page = 1)                     => apiClient.get(`/admin/users?page=${page}`),
  changeUserRole:  (id: string, role: string)     => apiClient.put(`/admin/users/${id}/role`, { role }),
  banUser:         (id: string, isBanned: boolean) => apiClient.put(`/admin/users/${id}/ban`, { isBanned }),
  getFlaggedNotes: (page = 1)                     => apiClient.get(`/admin/notes/flagged?page=${page}`),
  flagNote:        (id: string, reason?: string)  => apiClient.post(`/admin/notes/${id}/flag`, { reason }),
  moderateNote:    (id: string, action: string)   => apiClient.put(`/admin/notes/${id}/moderation`, { action }),
  deleteNote:      (id: string)                   => apiClient.delete(`/admin/notes/${id}`),
  deleteGroup:     (id: string)                   => apiClient.delete(`/admin/groups/${id}`),
};