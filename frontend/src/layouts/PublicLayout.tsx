import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Event,
  Person,
  Login,
  Home,
  Info,
  ContactSupport,
  Search,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/common/Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { text: 'Beranda', path: '/', icon: <Home /> },
    { text: 'Event', path: '/events', icon: <Event /> },
    { text: 'Daftar Hadir', path: '/attendance', icon: <Event /> },
    { text: 'Tentang Kami', path: '/about', icon: <Info /> },
    { text: 'Kontak', path: '/contact', icon: <ContactSupport /> },
    { text: 'Cari Sertifikat', path: '/certificates/search', icon: <Search /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: scrolled 
            ? 'rgba(0, 0, 0, 0.1)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: scrolled ? 'blur(15px)' : 'blur(5px)',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.2)' : '0 2px 20px rgba(0,0,0,0.1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          color: scrolled ? 'white' : 'text.primary',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar 
            sx={{ 
              justifyContent: 'space-between', 
              py: scrolled ? 1.5 : 2,
              minHeight: scrolled ? 64 : 72,
            }}
          >
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h5"
                component={Link}
                to="/"
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: scrolled ? '1.4rem' : '1.6rem',
                  transition: 'all 0.3s ease',
                }}
              >
                <Event 
                  sx={{ 
                    color: scrolled ? '#667eea' : 'primary.main',
                    fontSize: scrolled ? '1.6rem' : '1.8rem',
                    transition: 'all 0.3s ease',
                  }} 
                />
                EventHub
              </Typography>
            </Box>

            {/* Desktop Navigation - Simplified */}
            {!isMobile && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
              }}>
                {menuItems.slice(0, 3).map((item) => ( // Only show first 3 items
                  <Button
                    key={item.text}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: scrolled ? '#667eea' : '#667eea',
                      textTransform: 'none',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      fontSize: '0.9rem',
                      px: 1.5,
                      py: 0.8,
                      borderRadius: 1.5,
                      '&:hover': {
                        backgroundColor: scrolled 
                          ? 'rgba(102, 126, 234, 0.15)' 
                          : 'rgba(102, 126, 234, 0.1)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}

            {/* Auth Buttons - Simplified */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
            }}>
              {isAuthenticated ? (
                <>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/my-events')}
                    sx={{
                      background: scrolled 
                        ? 'rgba(102, 126, 234, 0.9)' 
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: scrolled ? 'white' : 'white',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontSize: '0.85rem',
                      '&:hover': {
                        background: scrolled 
                          ? 'rgba(102, 126, 234, 1)' 
                          : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    My Events
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/profile')}
                    sx={{
                      borderColor: scrolled ? 'rgba(102, 126, 234, 0.5)' : '#667eea',
                      color: scrolled ? '#667eea' : '#667eea',
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontSize: '0.85rem',
                      borderWidth: 1.5,
                      '&:hover': {
                        borderColor: scrolled ? '#667eea' : '#5a6fd8',
                        color: scrolled ? '#667eea' : '#5a6fd8',
                        backgroundColor: scrolled ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/login')}
                    sx={{
                      borderColor: scrolled ? 'rgba(102, 126, 234, 0.5)' : '#667eea',
                      color: scrolled ? '#667eea' : '#667eea',
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontSize: '0.85rem',
                      borderWidth: 1.5,
                      '&:hover': {
                        borderColor: scrolled ? '#667eea' : '#5a6fd8',
                        color: scrolled ? '#667eea' : '#5a6fd8',
                        backgroundColor: scrolled ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/register')}
                    sx={{
                      background: scrolled 
                        ? 'rgba(102, 126, 234, 0.9)' 
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: scrolled ? 'white' : 'white',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontSize: '0.85rem',
                      '&:hover': {
                        background: scrolled 
                          ? 'rgba(102, 126, 234, 1)' 
                          : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Register
                  </Button>
                </>
              )}

              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{ 
                    ml: 1,
                    p: 1,
                    border: `1.5px solid ${scrolled ? 'rgba(255, 255, 255, 0.3)' : 'primary.main'}`,
                    '&:hover': {
                      backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, pt: scrolled ? 8 : 10 }}>
        {children}
      </Box>

      {/* Footer */}
      <Footer />

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 280, pt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  selected={location.pathname === item.path}
                >
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
            {isAuthenticated ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate('/my-events');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <ListItemText primary="My Events" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate('/my-certificates');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <ListItemText primary="My Certificates" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <ListItemText primary="Profile" />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <ListItemText primary="Login" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate('/register');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <ListItemText primary="Register" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default PublicLayout;
