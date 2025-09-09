import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AdminPanelSettings as AdminIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { eventService } from '../../services/api';
import { Event } from '../../types';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const EventManagement: React.FC = () => {
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Fetch events from API
  const { data: eventsResponse, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => eventService.getAllEvents({ per_page: 100 }),
  });

  const events = eventsResponse?.data || [];

  // Form states for new event
  // Helper function untuk mendapatkan tanggal default yang valid
  const getDefaultDates = () => {
    const today = new Date();
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + 5); // Event di H+5 (minimal H-3 dari pelaksanaan)
    
    const regDeadline = new Date(today);
    regDeadline.setDate(today.getDate() + 2); // Registration deadline H+2
    
    return {
      eventDate: eventDate.toISOString().split('T')[0],
      regDeadline: regDeadline.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultDates();

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: defaultDates.eventDate,
    start_time: '09:00',
    end_time: '17:00',
    location: '',
    max_participants: 100,
    registration_deadline: defaultDates.regDeadline,
    flyer: null as File | null,
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  });

  // Form states for new admin
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    role: 'admin',
    password: '',
    confirm_password: ''
  });

  const handleEventSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', eventForm.title);
      formData.append('description', eventForm.description);
      formData.append('date', eventForm.date);
      formData.append('start_time', eventForm.start_time);
      formData.append('end_time', eventForm.end_time);
      formData.append('location', eventForm.location);
      formData.append('max_participants', eventForm.max_participants.toString());
      formData.append('registration_deadline', eventForm.registration_deadline);
      
      if (eventForm.flyer) {
        formData.append('flyer', eventForm.flyer);
      }

      if (selectedEvent) {
        // Update existing event
        const response = await eventService.updateEvent(selectedEvent.id, formData);
        
        setSnackbar({
          open: true,
          message: 'Event berhasil diupdate',
          severity: 'success'
        });
      } else {
        // Add new event
        const response = await eventService.createEvent(formData);
        
        setSnackbar({
          open: true,
          message: 'Event berhasil ditambahkan',
          severity: 'success'
        });
      }
      
      // Refresh events list
      refetchEvents();
      
    } catch (error: any) {
      console.error('Error saving event:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Gagal menyimpan event',
        severity: 'error'
      });
    }
    
    setEventDialogOpen(false);
    setSelectedEvent(null);
    setEventForm({
      title: '',
      description: '',
      date: defaultDates.eventDate,
      start_time: '09:00',
      end_time: '17:00',
      location: '',
      max_participants: 100,
      registration_deadline: defaultDates.regDeadline,
      flyer: null,
      status: 'upcoming'
    });
  };

  const handleAdminSubmit = () => {
    if (adminForm.password !== adminForm.confirm_password) {
      setSnackbar({
        open: true,
        message: 'Password tidak cocok',
        severity: 'error'
      });
      return;
    }

    if (selectedAdmin) {
      // Update existing admin
      setAdmins(prev => prev.map(admin => 
        admin.id === selectedAdmin.id 
          ? { ...admin, ...adminForm, password: undefined, confirm_password: undefined }
          : admin
      ));
      setSnackbar({
        open: true,
        message: 'Admin berhasil diupdate',
        severity: 'success'
      });
    } else {
      // Add new admin
      const newAdmin: AdminUser = {
        id: Date.now(),
        name: adminForm.name,
        email: adminForm.email,
        role: adminForm.role,
        is_active: true,
        created_at: new Date().toISOString()
      };
      setAdmins(prev => [...prev, newAdmin]);
      setSnackbar({
        open: true,
        message: 'Admin berhasil ditambahkan',
        severity: 'success'
      });
    }
    
    setAdminDialogOpen(false);
    setSelectedAdmin(null);
    setAdminForm({
      name: '',
      email: '',
      role: 'admin',
      password: '',
      confirm_password: ''
    });
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      location: event.location,
      max_participants: event.max_participants,
      registration_deadline: event.registration_deadline || '',
      flyer: null,
      status: event.status
    });
    setEventDialogOpen(true);
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setAdminForm({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      password: '',
      confirm_password: ''
    });
    setAdminDialogOpen(true);
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await eventService.deleteEvent(eventId);
      refetchEvents();
      setSnackbar({
        open: true,
        message: 'Event berhasil dihapus',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Gagal menghapus event',
        severity: 'error'
      });
    }
  };

  const handleExportParticipants = async (eventId: number) => {
    try {
      const response = await api.get(`/admin/events/${eventId}/export-participants`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `participants_event_${eventId}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSnackbar({
        open: true,
        message: 'Data peserta berhasil diekspor',
        severity: 'success'
      });
    } catch (error) {
      console.error('Export failed:', error);
      setSnackbar({
        open: true,
        message: 'Gagal mengekspor data peserta',
        severity: 'error'
      });
    }
  };

  const handleDeleteAdmin = (adminId: number) => {
    setAdmins(prev => prev.filter(admin => admin.id !== adminId));
    setSnackbar({
      open: true,
      message: 'Admin berhasil dihapus',
      severity: 'success'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'primary';
      case 'ongoing': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Akan Datang';
      case 'ongoing': return 'Sedang Berlangsung';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3, minHeight: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          Manajemen Event & Admin
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kelola event dan tambah admin baru untuk EventHub
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setEventDialogOpen(true)}
          sx={{ bgcolor: 'primary.main' }}
        >
          Tambah Event
        </Button>
        <Button
          variant="outlined"
          startIcon={<AdminIcon />}
          onClick={() => setAdminDialogOpen(true)}
        >
          Tambah Admin
        </Button>
      </Box>

      {/* Content Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 3 
      }}>
        {/* Events Section */}
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Daftar Event
                </Typography>
                <Chip 
                  label={`${events.length} Event`} 
                  color="primary" 
                  variant="outlined"
                />
              </Box>

              {eventsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : events.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Belum ada event
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mulai dengan menambahkan event pertama Anda
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Event</TableCell>
                        <TableCell>Tanggal & Waktu</TableCell>
                        <TableCell>Lokasi</TableCell>
                        <TableCell>Peserta</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {event.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {event.description.substring(0, 50)}...
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {new Date(event.date).toLocaleDateString('id-ID')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {event.start_time} - {event.end_time}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {event.location}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {event.current_participants_count}/{event.max_participants}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(event.status)}
                              color={getStatusColor(event.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Lihat Detail">
                                <IconButton size="small" color="primary">
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Ekspor Data Peserta">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleExportParticipants(event.id)}
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Event">
                                <IconButton 
                                  size="small" 
                                  color="warning"
                                  onClick={() => handleEditEvent(event)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Hapus Event">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Admins Section */}
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Daftar Admin
                </Typography>
                <Chip 
                  label={`${admins.length} Admin`} 
                  color="secondary" 
                  variant="outlined"
                />
              </Box>

              {admins.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AdminIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Belum ada admin
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tambah admin pertama untuk mengelola sistem
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {admins.map((admin) => (
                    <Paper key={admin.id} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {admin.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {admin.email}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            Role: {admin.role}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Admin">
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => handleEditAdmin(admin)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus Admin">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteAdmin(admin.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Event Dialog */}
      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedEvent ? 'Edit Event' : 'Tambah Event Baru'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Judul Event"
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="Lokasi"
                value={eventForm.location}
                onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                fullWidth
                required
              />
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Tanggal Event"
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Batas Pendaftaran"
                type="date"
                value={eventForm.registration_deadline}
                onChange={(e) => setEventForm(prev => ({ ...prev, registration_deadline: e.target.value }))}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Waktu Mulai"
                type="time"
                value={eventForm.start_time}
                onChange={(e) => setEventForm(prev => ({ ...prev, start_time: e.target.value }))}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Waktu Selesai"
                type="time"
                value={eventForm.end_time}
                onChange={(e) => setEventForm(prev => ({ ...prev, end_time: e.target.value }))}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Maksimal Peserta"
                type="number"
                value={eventForm.max_participants}
                onChange={(e) => setEventForm(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                fullWidth
                required
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={eventForm.status}
                  onChange={(e) => setEventForm(prev => ({ ...prev, status: e.target.value as any }))}
                  label="Status"
                >
                  <MenuItem value="upcoming">Akan Datang</MenuItem>
                  <MenuItem value="ongoing">Sedang Berlangsung</MenuItem>
                  <MenuItem value="completed">Selesai</MenuItem>
                  <MenuItem value="cancelled">Dibatalkan</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Upload Flyer/Poster Event"
              type="file"
              inputProps={{ accept: 'image/*' }}
              onChange={(e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                setEventForm(prev => ({ ...prev, flyer: file || null }));
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Deskripsi"
              value={eventForm.description}
              onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={4}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Batal</Button>
          <Button onClick={handleEventSubmit} variant="contained">
            {selectedEvent ? 'Update' : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Dialog */}
      <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAdmin ? 'Edit Admin' : 'Tambah Admin Baru'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nama Lengkap"
              value={adminForm.name}
              onChange={(e) => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={adminForm.email}
              onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={adminForm.role}
                onChange={(e) => setAdminForm(prev => ({ ...prev, role: e.target.value }))}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
              </Select>
            </FormControl>
            {!selectedAdmin && (
              <>
                <TextField
                  label="Password"
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                  fullWidth
                  required
                />
                <TextField
                  label="Konfirmasi Password"
                  type="password"
                  value={adminForm.confirm_password}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                  fullWidth
                  required
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminDialogOpen(false)}>Batal</Button>
          <Button onClick={handleAdminSubmit} variant="contained">
            {selectedAdmin ? 'Update' : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EventManagement;
