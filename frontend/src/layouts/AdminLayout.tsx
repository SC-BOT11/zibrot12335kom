import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Event,
  People,
  School,
  Settings,
  Notifications,
  AccountCircle,
  Logout,
  ChevronLeft,
  Assessment,
  AdminPanelSettings,
  Payment,
  BugReport,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin', description: 'Overview & Analytics' },
    { text: 'User Management', icon: <People />, path: '/admin/users', description: 'Manage Users & Permissions' },
    { text: 'Event Management', icon: <Event />, path: '/admin/events', description: 'Create & Manage Events' },
    { text: 'Event Debug', icon: <BugReport />, path: '/admin/events/debug', description: 'Debug Event Issues' },
    { text: 'Participants', icon: <People />, path: '/admin/participants', description: 'View & Manage Participants' },
    { text: 'Certificate Management', icon: <School />, path: '/admin/certificate-management', description: 'Manage Event Certificates' },
    { text: 'Certificates', icon: <School />, path: '/admin/certificates', description: 'View All Certificates' },
    { text: 'Payment Dashboard', icon: <Payment />, path: '/admin/payment-dashboard', description: 'Payment Analytics & Stats' },
    { text: 'Payment Management', icon: <Payment />, path: '/admin/payments', description: 'Manage All Payments' },
    { text: 'Payment Settings', icon: <Settings />, path: '/admin/payment-settings', description: 'Configure Payment Gateway' },
    { text: 'Reports', icon: <Assessment />, path: '/admin/reports', description: 'Analytics & Reports' },
    { text: 'Settings', icon: <Settings />, path: '/admin/settings', description: 'System Configuration' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderRadius: 0,
        }}
      >
        <Toolbar sx={{ minHeight: 70 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <AdminPanelSettings sx={{ fontSize: 28, color: '#667eea' }} />
            <Box>
              <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 700, color: 'white' }}>
                Admin Panel
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                EventHub Management System
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton color="inherit" sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } 
              }}>
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Account">
              <IconButton
                color="inherit"
                onClick={handleProfileMenuOpen}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } 
                }}
              >
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#667eea', color: 'white', fontWeight: 700 }}>
                  {user?.name?.charAt(0) || 'A'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
            color: 'white',
            borderRight: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
            borderRadius: 0,
          },
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Toolbar sx={{ minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Event sx={{ fontSize: 32, color: '#667eea' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              EventHub
            </Typography>
          </Box>
        </Toolbar>
        
        <Box sx={{ overflow: 'auto', px: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 215, 0, 0.2)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 215, 0, 0.25)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: location.pathname === item.path ? '#667eea' : 'rgba(255,255,255,0.8)',
                    minWidth: 40,
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <Box sx={{ flex: 1 }}>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: location.pathname === item.path ? 600 : 500,
                        fontSize: '0.95rem',
                      }}
                    />
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255,255,255,0.6)', 
                      fontSize: '0.75rem',
                      display: 'block',
                      mt: 0.5,
                    }}>
                      {item.description}
                    </Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
          
          {/* Admin Status */}
          <Box sx={{ p: 2, bgcolor: 'rgba(255, 215, 0, 0.1)', borderRadius: 2, border: '1px solid rgba(255, 215, 0, 0.2)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AdminPanelSettings sx={{ color: '#667eea', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ color: '#667eea', fontWeight: 600 }}>
                Admin Status
              </Typography>
            </Box>
            <Chip 
              label="Super Admin" 
              size="small" 
              sx={{ 
                bgcolor: '#667eea', 
                color: '#1e3c72', 
                fontWeight: 600,
                fontSize: '0.75rem',
              }} 
            />
          </Box>
        </Box>
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
            color: 'white',
            borderRadius: 0,
          },
        }}
      >
        <Toolbar sx={{ minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Event sx={{ fontSize: 32, color: '#667eea' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              EventHub
            </Typography>
          </Box>
        </Toolbar>
        
        <Box sx={{ overflow: 'auto', px: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    setOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 215, 0, 0.2)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 215, 0, 0.25)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: location.pathname === item.path ? '#667eea' : 'rgba(255,255,255,0.8)',
                    minWidth: 40,
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <Box sx={{ flex: 1 }}>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: location.pathname === item.path ? 600 : 500,
                        fontSize: '0.95rem',
                      }}
                    />
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255,255,255,0.6)', 
                      fontSize: '0.75rem',
                      display: 'block',
                      mt: 0.5,
                    }}>
                      {item.description}
                    </Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        className="admin-main-content"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
          overflow: 'auto',
          height: '100vh',
        }}
      >
        <Toolbar sx={{ minHeight: 70 }} />
        <Box 
          className="admin-content"
          sx={{ 
            minHeight: 'calc(100vh - 70px)',
            overflow: 'visible',
            pb: 4
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: 2,
          }
        }}
      >
        <MenuItem onClick={() => navigate('/admin/profile')} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminLayout;

