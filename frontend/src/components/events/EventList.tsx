import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FilterList,
  Event,
  LocationOn,
  Schedule,
  People,
  CalendarToday,
  Visibility,
  CheckCircle,
  Cancel,
  Info,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '../../services/api';
import { Event as EventType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface EventListProps {
  showRegistrationButton?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  maxItems?: number;
}

const EventList: React.FC<EventListProps> = ({
  showRegistrationButton = true,
  showSearch = true,
  showFilters = true,
  maxItems,
}) => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [registrationDialog, setRegistrationDialog] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const {
    data: eventsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['events', { search: searchTerm, status: statusFilter, page }],
    queryFn: () =>
      eventService.getAllEvents({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        page,
        per_page: maxItems || 12,
      }),
  });

  const events = eventsResponse?.data || [];
  const pagination = eventsResponse ? {
    current_page: eventsResponse.current_page,
    last_page: eventsResponse.last_page,
    per_page: eventsResponse.per_page,
    total: eventsResponse.total,
  } : undefined;

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleStatusFilter = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRegister = async (event: EventType) => {
    if (!isAuthenticated) {
      // Redirect to login or show login dialog
      return;
    }

    setSelectedEvent(event);
    setRegistrationDialog(true);
  };

  const confirmRegistration = async () => {
    if (!selectedEvent) return;

    setRegistrationLoading(true);
    try {
      await eventService.registerForEvent(selectedEvent.id);
      setRegistrationDialog(false);
      setSelectedEvent(null);
      refetch(); // Refresh the events list
      // Show success message
    } catch (error) {
      console.error('Registration failed:', error);
      // Show error message
    } finally {
      setRegistrationLoading(false);
    }
  };

  const getEventStatus = (event: EventType) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    let eventDateTime: Date;
    
    if (event.start_time) {
      eventDateTime = new Date(event.date + 'T' + event.start_time);
    } else {
      eventDateTime = eventDate;
    }

    if (eventDateTime < now) {
      return { status: 'completed', label: 'Selesai', color: 'default' as const };
    } else if (eventDate.toDateString() === now.toDateString()) {
      return { status: 'ongoing', label: 'Sedang Berlangsung', color: 'success' as const };
    } else {
      return { status: 'upcoming', label: 'Akan Datang', color: 'primary' as const };
    }
  };

  const isRegistrationOpen = (event: EventType) => {
    const now = new Date();
    let eventDateTime: Date;
    
    if (event.start_time) {
      eventDateTime = new Date(event.date + 'T' + event.start_time);
    } else {
      eventDateTime = new Date(event.date);
    }
    
    return eventDateTime > now;
  };

  const formatEventDate = (date: string, time?: string) => {
    try {
      let eventDate: Date;
      if (time) {
        eventDate = new Date(date + 'T' + time);
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
    return time;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Gagal memuat data event. Silakan coba lagi.
      </Alert>
    );
  }

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', py: 4 }}>
      {/* Search and Filter Section */}
      {(showSearch || showFilters) && (
        <Box sx={{ 
          mb: 4, 
          p: 4, 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold" color="primary" sx={{ mb: 3 }}>
            Cari Event Favorit Anda
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, alignItems: 'center' }}>
            {showSearch && (
              <Box>
                <TextField
                  fullWidth
                  placeholder="Cari event berdasarkan judul, deskripsi, atau lokasi..."
                  value={searchTerm}
                  onChange={handleSearch}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'primary.main' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Box>
            )}
            {showFilters && (
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Status Event</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    variant="outlined"
                    startAdornment={<FilterList sx={{ mr: 1, color: 'primary.main' }} />}
                    sx={{
                      borderRadius: 3,
                      '& .MuiOutlinedInput-notchedOutline': {
                        '&:hover': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Semua Status</MenuItem>
                    <MenuItem value="upcoming">Akan Datang</MenuItem>
                    <MenuItem value="ongoing">Sedang Berlangsung</MenuItem>
                    <MenuItem value="completed">Selesai</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Events Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 4 }}>
        {events.map((event: EventType, index: number) => {
          const eventStatus = getEventStatus(event);
          const registrationOpen = isRegistrationOpen(event);

          return (
            <Box key={event.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  },
                }}
              >
                {/* Event Image */}
                <CardMedia
                  component="img"
                  height="200"
                  image={event.image || '/default-event-image.jpg'}
                  alt={event.title}
                  sx={{ objectFit: 'cover' }}
                />

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Event Status */}
                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={eventStatus.label}
                      color={eventStatus.color}
                      size="small"
                      icon={<Event />}
                    />
                  </Box>

                  {/* Event Title */}
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

                  {/* Event Details */}
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

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.current_participants_count} / {event.max_participants || '∞'} peserta
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <Tooltip title="Lihat Detail">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          // Navigate to event detail
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>

                    {showRegistrationButton && isAuthenticated && registrationOpen && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Event />}
                        onClick={() => handleRegister(event)}
                        disabled={event.current_participants_count >= event.max_participants}
                        sx={{ flexGrow: 1 }}
                      >
                        Daftar
                      </Button>
                    )}

                    {showRegistrationButton && !isAuthenticated && registrationOpen && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Info />}
                        onClick={() => {
                          // Show login prompt
                        }}
                        sx={{ flexGrow: 1 }}
                      >
                        Login untuk Daftar
                      </Button>
                    )}

                    {!registrationOpen && (
                      <Chip
                        label="Pendaftaran Ditutup"
                        color="error"
                        size="small"
                        icon={<Cancel />}
                        sx={{ flexGrow: 1 }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.last_page}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Registration Dialog */}
      <Dialog open={registrationDialog} onClose={() => setRegistrationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Konfirmasi Pendaftaran</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedEvent.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Apakah Anda yakin ingin mendaftar untuk event ini?
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
                <Typography variant="body2">
                  {formatEventDate(selectedEvent.date, selectedEvent.start_time)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ fontSize: 16, mr: 1 }} />
                <Typography variant="body2">{selectedEvent.location}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 16, mr: 1 }} />
                <Typography variant="body2">
                  {selectedEvent.current_participants_count} / {selectedEvent.max_participants || '∞'} peserta
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistrationDialog(false)} disabled={registrationLoading}>
            Batal
          </Button>
          <Button
            onClick={confirmRegistration}
            variant="contained"
            disabled={registrationLoading}
            startIcon={registrationLoading ? <CircularProgress size={16} /> : <CheckCircle />}
          >
            {registrationLoading ? 'Mendaftar...' : 'Konfirmasi Daftar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventList;
