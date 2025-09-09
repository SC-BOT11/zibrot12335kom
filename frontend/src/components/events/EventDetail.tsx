import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  Event,
  LocationOn,
  Schedule,
  People,
  CalendarToday,
  CheckCircle,
  Cancel,
  Info,
  School,
  Visibility,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../../services/api';
import { Event as EventType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import PaymentForm from '../payment/PaymentForm';

const EventDetail: React.FC = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [registrationDialog, setRegistrationDialog] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);

  // Fetch event details
  const {
    data: eventResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getEventById(parseInt(eventId!)),
    enabled: !!eventId,
  });

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: (eventId: number) => eventService.registerForEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      setRegistrationDialog(false);
    },
  });

  const event = eventResponse?.data;

  const handleRegister = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // If event has price, show payment dialog, otherwise show registration dialog
    if (event && event.is_paid_event) {
      setPaymentDialog(true);
    } else {
      setRegistrationDialog(true);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!eventId) return;
    
    setRegistrationLoading(true);
    try {
      await registerMutation.mutateAsync(parseInt(eventId));
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setRegistrationLoading(false);
    }
  };

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

  const formatEventTime = (time?: string) => {
    if (!time) return 'Waktu tidak ditentukan';
    try {
      return format(new Date('2000-01-01 ' + time), 'HH:mm', { locale: id });
    } catch (error) {
      console.error('Error formatting time:', error);
      return time;
    }
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

  if (error || !event) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Gagal memuat detail event. Silakan coba lagi.
        </Alert>
      </Container>
    );
  }

  const eventStatus = getEventStatus(event);
  const isRegistrationOpen = event.is_registration_open;
  const isUserRegistered = false; // TODO: Check if user is registered

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Event Header */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 4 }}>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / 9' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip
                  label={eventStatus.label}
                  color={eventStatus.color}
                  icon={<Event />}
                />
                {isRegistrationOpen && (
                  <Chip
                    label="Pendaftaran Terbuka"
                    color="success"
                    icon={<CheckCircle />}
                  />
                )}
              </Box>

              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                {event.title}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {event.description}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarToday sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatEventDate(event.date, event.start_time)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Schedule sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatEventTime(event.start_time)} - {formatEventTime(event.end_time)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOn sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {event.location}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <People sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {event.current_participants_count} / {event.max_participants} peserta
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ gridColumn: { xs: '1', md: '9 / 13' } }}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={event.image || '/default-event-image.jpg'}
                  alt={event.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pendaftaran
                  </Typography>
                  
                  {isUserRegistered ? (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Anda sudah terdaftar untuk event ini
                    </Alert>
                  ) : (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {isRegistrationOpen 
                        ? 'Pendaftaran masih terbuka'
                        : 'Pendaftaran sudah ditutup'
                      }
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={!isRegistrationOpen || isUserRegistered}
                    onClick={handleRegister}
                    sx={{ mb: 2 }}
                  >
                    {isUserRegistered ? 'Sudah Terdaftar' : 'Daftar Event'}
                  </Button>

                  {isUserRegistered && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={() => navigate('/attendance')}
                      sx={{ mb: 2 }}
                    >
                      Daftar Hadir
                    </Button>
                  )}

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/events')}
                  >
                    Kembali ke Daftar Event
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Paper>

        {/* Event Details */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 4 }}>
          <Box sx={{ gridColumn: { xs: '1', md: '1 / 9' } }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Detail Event
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="body1" paragraph>
                {event.description}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Informasi Penting:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Info color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Pastikan Anda hadir tepat waktu"
                    secondary="Keterlambatan dapat mempengaruhi kelayakan sertifikat"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <School color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sertifikat akan diberikan"
                    secondary="Setelah mengisi daftar hadir dan mengikuti event"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Visibility color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dress code"
                    secondary="Pakaian rapi dan sopan"
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>

          <Box sx={{ gridColumn: { xs: '1', md: '9 / 13' } }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Statistik Event
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Peserta Terdaftar
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {event.current_participants_count}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Event />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Kapasitas Maksimal
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {event.max_participants}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <School />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Sertifikat
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    Tersedia
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Registration Confirmation Dialog */}
      <Dialog open={registrationDialog} onClose={() => setRegistrationDialog(false)}>
        <DialogTitle>Konfirmasi Pendaftaran</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin mendaftar untuk event "{event.title}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Setelah mendaftar, Anda akan menerima email konfirmasi dengan token kehadiran.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistrationDialog(false)}>
            Batal
          </Button>
          <Button
            onClick={handleConfirmRegistration}
            variant="contained"
            disabled={registrationLoading}
          >
            {registrationLoading ? <CircularProgress size={20} /> : 'Daftar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Event sx={{ color: '#667eea' }} />
            Pembayaran Event
          </Typography>
        </DialogTitle>
        <DialogContent>
          {event && (
            <PaymentForm
              event={{
                id: event.id,
                title: event.title,
                price: event.ticket_price || 0,
                date: event.date,
                location: event.location,
              }}
              onPaymentSuccess={(paymentData) => {
                setPaymentDialog(false);
                // Redirect to payment status page
                navigate(`/payment/${paymentData.payment.payment_id}`);
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>
            Batal
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventDetail;
