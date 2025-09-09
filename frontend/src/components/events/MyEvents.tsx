import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Event,
  LocationOn,
  Schedule,
  CalendarToday,
  Visibility,
  CheckCircle,
  AccessTime,
  School,
  QrCode,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '../../services/api';
import { Event as EventType } from '../../types';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const MyEvents: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: eventsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['my-events'],
    queryFn: () => eventService.getMyEvents(),
  });

  const events = eventsResponse?.data || [];

  const getEventStatus = (event: EventType) => {
    const now = new Date();
    const eventDate = new Date(event.date + ' ' + event.start_time);
    
    if (eventDate < now) {
      return { label: 'Selesai', color: 'default' as const };
    } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { label: 'Sedang Berlangsung', color: 'success' as const };
    } else {
      return { label: 'Akan Datang', color: 'primary' as const };
    }
  };

  const formatEventDate = (date: string, time?: string) => {
    try {
      let eventDate: Date;
      if (time) {
        eventDate = new Date(date + ' ' + time);
      } else {
        eventDate = new Date(date);
      }
      return format(eventDate, 'EEEE, dd MMMM yyyy', { locale: id });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Tanggal tidak valid';
    }
  };

  const formatEventTime = (time: string) => {
    return format(new Date('2000-01-01 ' + time), 'HH:mm', { locale: id });
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Gagal memuat event Anda. Silakan coba lagi.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Event Saya
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Daftar event yang telah Anda daftar
        </Typography>

        {events.length === 0 ? (
          <Alert severity="info">
            Anda belum mendaftar untuk event apapun. 
            <Button
              variant="text"
              onClick={() => navigate('/events')}
              sx={{ ml: 1, textTransform: 'none' }}
            >
              Jelajahi event yang tersedia
            </Button>
          </Alert>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {events.map((event: EventType) => {
              const eventStatus = getEventStatus(event);

              return (
                <Box key={event.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={event.image || '/default-event-image.jpg'}
                      alt={event.title}
                      sx={{ objectFit: 'cover' }}
                    />

                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={eventStatus.label}
                          color={eventStatus.color}
                          size="small"
                          icon={<Event />}
                        />
                      </Box>

                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 'bold',
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {event.title}
                      </Typography>

                      <Box sx={{ mb: 2, flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatEventDate(event.date, event.start_time)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Schedule sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatEventTime(event.start_time)} - {formatEventTime(event.end_time)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {event.location}
                          </Typography>
                        </Box>

                        {/* Attendance Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Token: {(event as any).attendance_token || 'N/A'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircle sx={{ 
                            fontSize: 16, 
                            mr: 1, 
                            color: (event as any).is_attendance_verified ? 'success.main' : 'text.secondary' 
                          }} />
                          <Typography 
                            variant="body2" 
                            color={(event as any).is_attendance_verified ? 'success.main' : 'text.secondary'}
                            sx={{ fontWeight: (event as any).is_attendance_verified ? 'bold' : 'normal' }}
                          >
                            {(event as any).is_attendance_verified ? 'Sudah Hadir' : 'Belum Hadir'}
                          </Typography>
                        </Box>

                        {/* Certificate Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <School sx={{ 
                            fontSize: 16, 
                            mr: 1, 
                            color: (event as any).has_certificate ? 'primary.main' : 'text.secondary' 
                          }} />
                          <Typography 
                            variant="body2" 
                            color={(event as any).has_certificate ? 'primary.main' : 'text.secondary'}
                            sx={{ fontWeight: (event as any).has_certificate ? 'bold' : 'normal' }}
                          >
                            {(event as any).has_certificate ? 'Sertifikat Tersedia' : 'Belum Ada Sertifikat'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${event.id}`);
                          }}
                        >
                          Detail
                        </Button>
                        
                        {eventStatus.label === 'Sedang Berlangsung' && !(event as any).is_attendance_verified && (
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<QrCode />}
                            fullWidth
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/attendance');
                            }}
                          >
                            Hadir
                          </Button>
                        )}
                        
                        {(event as any).has_certificate && (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<School />}
                            fullWidth
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/my-certificates');
                            }}
                          >
                            Sertifikat
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default MyEvents;
