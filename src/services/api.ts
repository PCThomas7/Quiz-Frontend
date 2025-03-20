import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Changed from 'user' to 'token'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get stored refresh token if you have one
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const { token } = response.data;
        localStorage.setItem('token', token);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear stored tokens
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const fetchUsers = async (filters: {
  search?: string;
  batch?: string;
  role?: string;
  status?: string;
}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.batch && filters.batch !== 'All') params.append('batch', filters.batch);
  if (filters.role && filters.role !== 'All') params.append('role', filters.role);
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);

  const response = await api.get(`/users?${params.toString()}`);
  return response.data;
};

// Example login function
export const login = async (credentials: { email: string; password: string }) => {
  const response = await api.post('/auth/login', credentials);
  const { token } = response.data;
  localStorage.setItem('token', token);
  return response.data;
};

interface UserUpdateResponse {
  _id: string;
  role: string;
  batches: Array<{
    _id: string;
    name: string;
  }>;
  status: string;
}

export const updateUserRole = async (userId: string, role: string): Promise<UserUpdateResponse> => {
  const response = await api.put(`/users/${userId}/role`, { role });
  return response.data;
};

export const updateUserBatches = async (
  userId: string, 
  batches: string[]
): Promise<UserUpdateResponse> => {
  const response = await api.put(`/users/${userId}/batches`, { batches });
  return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`);
};

interface InvitationResponse {
  success: string[];
  already_exists: string[];
  failed: string[];
}

export const sendInvitation = async (data: InvitationRequest): Promise<InvitationResponse> => {
  const response = await api.post('/invitations', {
    ...data,
    // Ensure all IDs are properly formatted
    batches: data.batches,
    batchSubscriptions: data.batchSubscriptions.map(sub => ({
      batch: sub.batch,
      expiresOn: sub.expiresOn
    }))
  });
  return response.data;
};

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    profilePicture?: string;
  };
}

export const handleGoogleLogin = async (googleToken: string): Promise<AuthResponse> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
    token: googleToken
  });

  const { token, user } = response.data;
  
  // Store token and user data
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  return response.data;
};

interface EmailResponse {
  success: string[];
  failed: string[];
}

export const sendBulkEmails = async ({
  subject,
  body,
  users
}: {
  subject: string;
  body: string;
  users: string[];
}): Promise<EmailResponse> => {
  const response = await api.post('/email/bulk', {
    subject,
    body,
    users
  });
  return response.data;
};

interface Batch {
  _id: string;
  name: string;
  description?: string;
  active: boolean;
  createdBy: string;
}

// Fetch all batches
export const fetchBatches = async (): Promise<Batch[]> => {
  const response = await api.get('/batches');
  return response.data;
};

// Create new batch
export const createBatch = async (data: { name: string; description?: string }): Promise<Batch> => {
  const response = await api.post('/batches', data);
  return response.data;
};

// Update batch
export const updateBatch = async (id: string, data: { 
  name?: string; 
  description?: string; 
  active?: boolean; 
}): Promise<Batch> => {
  const response = await api.put(`/batches/${id}`, data);
  return response.data;
};

// Delete batch
export const deleteBatch = async (id: string): Promise<{ message: string; deactivated: boolean }> => {
  const response = await api.delete(`/batches/${id}`);
  return response.data;
};