import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Event, 
  Participant, 
  Certificate, 
  Attendance,
  LoginCredentials,
  RegisterData,
  PasswordResetData,
  EventFormData,
  SearchParams,
  DashboardStats,
  ChartData,
  ApiResponse,
  PaginatedResponse
} from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.log('API Response Interceptor Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      const errorData = error.response?.data;
      
      // Check if it's a session timeout error
      if (errorData?.code === 'SESSION_EXPIRED') {
        console.log('Session expired, redirecting to login');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('last_activity');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Only redirect if we're not already on login page and not on verification page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/verification')) {
        console.log('Redirecting to login due to 401 error');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('last_activity');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  // Register
  register: async (data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/register', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  // Forgot Password
  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  },

  // Reset Password
  resetPassword: async (data: PasswordResetData): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post('/reset-password', data);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/user');
    return response.data;
  },

  // Verify Email
  verifyEmail: async (id: number, hash: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.get(`/email/verify/${id}/${hash}`);
    return response.data;
  },

  // Resend verification email
  resendVerification: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post('/email/verification-notification');
    return response.data;
  },

  // Verify email with OTP
  verifyEmailWithOTP: async (data: { email: string; verification_code: string }): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post('/verify-email', data);
    return response.data;
  },

  // Resend verification email with OTP
  resendVerificationEmail: async (data: { email: string }): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post('/resend-verification', data);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (data: { email: string; otp: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/verify-otp', data);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (data: { email: string }): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post('/resend-otp', data);
    return response.data;
  },
};

// Event Services
export const eventService = {
  // Get all events
  getAllEvents: async (params?: SearchParams): Promise<PaginatedResponse<Event>> => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  // Get single event
  getEvent: async (id: number): Promise<ApiResponse<Event>> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Search events
  searchEvents: async (params: SearchParams): Promise<PaginatedResponse<Event>> => {
    const response = await api.get('/events/search', { params });
    return response.data;
  },

  // Create event (admin only)
  createEvent: async (data: FormData): Promise<ApiResponse<Event>> => {
    const response = await api.post('/events', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Update event (admin only)
  updateEvent: async (id: number, data: FormData): Promise<ApiResponse<Event>> => {
    const response = await api.put(`/events/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete event (admin only)
  deleteEvent: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Get event by ID
  getEventById: async (id: number): Promise<ApiResponse<Event>> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Register for event
  registerForEvent: async (eventId: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  },

  // Get my events
  getMyEvents: async (): Promise<PaginatedResponse<Event>> => {
    const response = await api.get('/my-events');
    return response.data;
  },

  // Get my certificates
  getMyCertificates: async (): Promise<PaginatedResponse<Certificate>> => {
    const response = await api.get('/my-certificates');
    return response.data;
  },

  // Mark attendance with token
  markAttendance: async (data: { attendance_token: string }): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post('/attendance', data);
    return response.data;
  },
};

// Participant Services
export const participantService = {
  // Get participants for an event
  getEventParticipants: async (eventId: number): Promise<PaginatedResponse<Participant>> => {
    const response = await api.get(`/events/${eventId}/participants`);
    return response.data;
  },

  // Add participant to event
  addParticipant: async (eventId: number, userId: number): Promise<ApiResponse<Participant>> => {
    const response = await api.post(`/events/${eventId}/participants`, { user_id: userId });
    return response.data;
  },

  // Remove participant from event
  removeParticipant: async (eventId: number, participantId: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/events/${eventId}/participants/${participantId}`);
    return response.data;
  },

  // Import participants from Excel
  importParticipants: async (eventId: number, file: File): Promise<ApiResponse<{ message: string; imported: number }>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/events/${eventId}/participants/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Export participants to Excel
  exportParticipants: async (eventId: number): Promise<Blob> => {
    const response = await api.get(`/events/${eventId}/export`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

// Certificate Services
export const certificateService = {
  // Generate certificate for participant
  generateCertificate: async (eventId: number, participantId: number): Promise<ApiResponse<Certificate>> => {
    const response = await api.post(`/events/${eventId}/participants/${participantId}/certificate`);
    return response.data;
  },

  // Generate all certificates for event
  generateAllCertificates: async (eventId: number): Promise<ApiResponse<{ message: string; generated: number }>> => {
    const response = await api.post(`/events/${eventId}/certificates/generate-all`);
    return response.data;
  },

  // Download certificate
  downloadCertificate: async (certificateId: number): Promise<Blob> => {
    const response = await api.get(`/certificates/${certificateId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get certificate details
  getCertificate: async (certificateId: number): Promise<ApiResponse<Certificate>> => {
    const response = await api.get(`/certificates/${certificateId}`);
    return response.data;
  },

  // Search certificates
  searchCertificates: async (params: SearchParams): Promise<PaginatedResponse<any>> => {
    const response = await api.get('/certificates/search', { params });
    return response.data;
  },
};

// Attendance Services
export const attendanceService = {
  // Mark attendance
  markAttendance: async (eventId: number, participantId: number, notes?: string): Promise<ApiResponse<Attendance>> => {
    const response = await api.post(`/events/${eventId}/participants/${participantId}/attendance`, { notes });
    return response.data;
  },

  // Get attendance for event
  getEventAttendance: async (eventId: number): Promise<PaginatedResponse<Attendance>> => {
    const response = await api.get(`/events/${eventId}/attendance`);
    return response.data;
  },
};

// Dashboard Services
export const dashboardService = {
  // Get dashboard stats
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Get chart data
  getChartData: async (): Promise<ApiResponse<ChartData>> => {
    const response = await api.get('/admin/dashboard/chart-data');
    return response.data;
  },

  // Export data
  exportData: async (type: 'events' | 'participants' | 'users', format: 'xlsx' | 'csv'): Promise<Blob> => {
    const response = await api.get(`/admin/export/${type}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },
};

// User Services
export const userService = {
  // Get user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/user');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  // Update user password
  updatePassword: async (data: { current_password: string; new_password: string; new_password_confirmation: string }): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.put('/password', data);
    return response.data;
  },

  // Admin: Get all users
  getUsers: async (params: any): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Admin: Get user details
  getUser: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Admin: Update user
  updateUser: async (id: number, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Admin: Delete user
  deleteUser: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Admin: Bulk actions
  bulkAction: async (userIds: number[], action: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post('/users/bulk-action', { user_ids: userIds, action });
    return response.data;
  },
};

export default api;
