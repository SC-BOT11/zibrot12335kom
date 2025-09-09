import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Event,
  School,
  Person,
  TrendingUp,
  CalendarToday,
  LocationOn,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Ribbon from '../components/common/Ribbon';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);

  // Check if user just completed registration + OTP verification
  useEffect(() => {
    const isNewUser = location.state?.message?.includes('berhasil diverifikasi') || 
                     location.state?.message?.includes('Selamat datang');
    
    if (isNewUser) {
      // Show confetti after a short delay for better effect
      const timer = setTimeout(() => {
        setShowConfetti(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    // Clear the message from location state
    navigate('/', { replace: true });
  };

  const upcomingEvents = [
    {
      id: 1,
      title: 'Workshop Web Development',
      date: '15 September 2025',
      time: '09:00 - 17:00',
      location: 'Auditorium Utama',
      description: 'Workshop intensif untuk mempelajari web development modern',
    },
    {
      id: 2,
      title: 'Seminar Digital Marketing',
      date: '20 September 2025',
      time: '13:00 - 16:00',
      location: 'Ruang Meeting A',
      description: 'Strategi digital marketing untuk bisnis di era digital',
    },
  ];

  const quickActions = [
    {
      title: 'Lihat Event',
      description: 'Jelajahi event yang tersedia',
      icon: <Event sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => navigate('/events'),
      color: 'primary.main',
    },
    {
      title: 'Sertifikat Saya',
      description: 'Lihat sertifikat yang sudah diperoleh',
      icon: <School sx={{ fontSize: 40, color: 'success.main' }} />,
      action: () => navigate('/my-certificates'),
      color: 'success.main',
    },
    {
      title: 'Event Saya',
      description: 'Event yang sudah diikuti',
      icon: <CalendarToday sx={{ fontSize: 40, color: 'info.main' }} />,
      action: () => navigate('/my-events'),
      color: 'info.main',
    },
    {
      title: 'Profile',
      description: 'Kelola informasi profile',
      icon: <Person sx={{ fontSize: 40, color: 'warning.main' }} />,
      action: () => navigate('/profile'),
      color: 'warning.main',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
              {/* Ribbon Animation */}
        <Ribbon isActive={showConfetti} onComplete={handleConfettiComplete} />

      {/* Welcome Section */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        {/* Special Welcome Message for New Users */}
        {location.state?.message && (
          <Box sx={{ 
            textAlign: 'center', 
            mb: 3, 
            p: 2, 
            bgcolor: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: 2,
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              🎉 Selamat Datang di Platform Kami! 🎉
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {location.state.message}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              fontSize: '2rem',
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Selamat Datang, {user?.name || 'User'}! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Selamat datang di platform event management kami
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body1" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
          Platform ini menyediakan berbagai event menarik dan sertifikat yang dapat membantu 
          pengembangan karir dan pengetahuan Anda. Jelajahi event yang tersedia dan daftar sekarang!
        </Typography>
      </Paper>

      {/* Quick Actions */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Akses Cepat
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3, 
        mb: 4 
      }}>
        {quickActions.map((action, index) => (
          <Card
            key={index}
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
            onClick={action.action}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ mb: 2 }}>{action.icon}</Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {action.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {action.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Upcoming Events */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Event Mendatang
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3, 
        mb: 4 
      }}>
        {upcomingEvents.map((event) => (
          <Card key={event.id} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                {event.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarToday sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="body2" color="textSecondary">
                  {event.date} • {event.time}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationOn sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="body2" color="textSecondary">
                  {event.location}
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                {event.description}
              </Typography>
            </CardContent>
            
            <CardActions>
              <Button
                size="small"
                variant="contained"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                Lihat Detail
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/events')}
              >
                Lihat Semua Event
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Statistics Overview */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
          Statistik Anda
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 3 
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Event sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              0
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Event Diikuti
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <School sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              0
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Sertifikat
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
              0%
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Progress
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Home;
