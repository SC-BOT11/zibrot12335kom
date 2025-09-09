import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import OTPVerification from './components/auth/OTPVerification';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import EventList from './components/events/EventList';
import EventDetail from './components/events/EventDetail';
import EventForm from './components/events/EventForm';
import MyEvents from './components/events/MyEvents';
import MyCertificates from './components/certificates/MyCertificates';
import AttendanceForm from './components/attendance/AttendanceForm';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import Participants from './components/admin/Participants';
import Certificates from './components/admin/Certificates';
import Reports from './components/admin/Reports';
import Settings from './components/admin/Settings';
import EventManagement from './components/admin/EventManagement';
import EventDebug from './components/admin/EventDebug';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';

import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import CertificateSearch from './components/certificates/CertificateSearch';
import Payment from './pages/Payment';
import PaymentManagement from './components/admin/PaymentManagement';
import PaymentSettings from './components/admin/PaymentSettings';
import PaymentDashboard from './components/admin/PaymentDashboard';
import PaymentTest from './components/admin/PaymentTest';
import CertificateManagement from './components/admin/CertificateManagement';
import LoadingDemo from './pages/LoadingDemo';
import Attendance from './pages/Attendance';
import { SessionTimeoutProvider } from './components/common/SessionTimeoutProvider';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8b9df0',
      dark: '#4a5fd8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#9a6bb8',
      dark: '#5a3a7a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': {
              borderColor: '#667eea',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#667eea',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_admin) {
    return <Navigate to="/events" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    // Redirect admin users to admin dashboard, regular users to events
    if (user?.is_admin) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/events" replace />;
    }
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <LoginForm />
            </AuthLayout>
          </PublicRoute>
        }
      />
      
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthLayout>
              <RegisterForm />
            </AuthLayout>
          </PublicRoute>
        }
      />

      <Route
        path="/verification"
        element={
          <AuthLayout>
            <OTPVerification />
          </AuthLayout>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <AuthLayout>
              <ForgotPasswordForm />
            </AuthLayout>
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <AuthLayout>
              <ResetPasswordForm />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Public Event Routes */}
      <Route path="/events" element={<PublicLayout><EventList /></PublicLayout>} />
      <Route path="/events/:id" element={<PublicLayout><EventDetail /></PublicLayout>} />

      {/* Public Certificate Search */}
      <Route path="/certificates/search" element={<PublicLayout><CertificateSearch /></PublicLayout>} />

      {/* Public Pages */}
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/loading-demo" element={<PublicLayout><LoadingDemo /></PublicLayout>} />

      {/* Protected User Routes */}


      <Route
        path="/my-events"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <MyEvents />
            </PublicLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-certificates"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <MyCertificates />
            </PublicLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <Attendance />
            </PublicLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance/:eventId"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <AttendanceForm />
            </PublicLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <Profile />
            </PublicLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment/:paymentId"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <Payment />
            </PublicLayout>
          </ProtectedRoute>
        }
      />


      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminRoute>
        }
      />


      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/events"
        element={
          <AdminRoute>
            <AdminLayout>
              <EventManagement />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/events/new"
        element={
          <AdminRoute>
            <AdminLayout>
              <EventForm isCreate={true} />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/events/:id/edit"
        element={
          <AdminRoute>
            <AdminLayout>
              <EventForm isEdit={true} />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/events/debug"
        element={
          <AdminRoute>
            <AdminLayout>
              <EventDebug />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/participants"
        element={
          <AdminRoute>
            <AdminLayout>
              <Participants />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/certificates"
        element={
          <AdminRoute>
            <AdminLayout>
              <Certificates />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <AdminLayout>
              <Reports />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminLayout>
              <Settings />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/payments"
        element={
          <AdminRoute>
            <AdminLayout>
              <PaymentManagement />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/payment-settings"
        element={
          <AdminRoute>
            <AdminLayout>
              <PaymentSettings />
            </AdminLayout>
          </AdminRoute>
        }
      />

        <Route
          path="/admin/payment-dashboard"
          element={
            <AdminRoute>
              <AdminLayout>
                <PaymentDashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/payment-test"
          element={
            <AdminRoute>
              <AdminLayout>
                <PaymentTest />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/certificate-management"
          element={
            <AdminRoute>
              <AdminLayout>
                <CertificateManagement />
              </AdminLayout>
            </AdminRoute>
          }
        />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <SessionTimeoutProvider>
              <AppRoutes />
            </SessionTimeoutProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
