import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Event,
  AccessTime,
  LocationOn,
  Person,
  QrCode,
  ContentCopy,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';

interface AttendanceEvent {
  event_id: number;
  event_title: string;
  event_date: string;
  event_start_time: string;
  attendance_token: string;
  attendance_status: 'pending' | 'present' | 'absent';
  is_attendance_verified: boolean;
  attendance_verified_at: string | null;
  can_attend: boolean;
  token_expires_at: string | null;
}

const Attendance: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<AttendanceEvent | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const queryClient = useQueryClient();

  // Fetch attendance status
  const { data: attendanceData, isLoading, error } = useQuery({
    queryKey: ['attendance-status'],
    queryFn: () => api.get('/attendance/status'),
    select: (response: any) => response.data.data,
  });

  // Verify attendance mutation
  const verifyAttendanceMutation = useMutation({
    mutationFn: (data: { event_id: number; token: string }) =>
      api.post('/attendance/verify', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-status'] });
      setShowTokenDialog(false);
      setTokenInput('');
    },
  });

  const handleShowToken = (event: AttendanceEvent) => {
    setSelectedEvent(event);
    setShowTokenDialog(true);
  };

  const handleVerifyAttendance = () => {
    if (selectedEvent && tokenInput.length === 10) {
      verifyAttendanceMutation.mutate({
        event_id: selectedEvent.event_id,
        token: tokenInput,
      });
    }
  };

  const handleCopyToken = () => {
    if (selectedEvent?.attendance_token) {
      navigator.clipboard.writeText(selectedEvent.attendance_token);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'pending':
        return 'warning';
      case 'absent':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return 'Hadir';
      case 'pending':
        return 'Belum Hadir';
      case 'absent':
        return 'Tidak Hadir';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Gagal memuat data kehadiran. Silakan coba lagi.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Daftar Hadir Kegiatan
      </Typography>

      {!attendanceData || attendanceData.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Belum ada kegiatan yang diikuti
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Daftar untuk mengikuti kegiatan terlebih dahulu
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {attendanceData.map((event: AttendanceEvent) => (
            <Box key={event.event_id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, lineHeight: 1.3 }}>
                    {event.event_title}
                  </Typography>

                  <Box sx={{ flex: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Event sx={{ mr: 1, color: '#667eea', fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary">
                        {format(parseISO(event.event_date), 'dd MMMM yyyy')}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime sx={{ mr: 1, color: '#f093fb', fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.event_start_time}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ mr: 1, color: '#4facfe', fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary">
                        Token: {event.attendance_token}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={getStatusLabel(event.attendance_status)}
                      color={getStatusColor(event.attendance_status) as any}
                      size="small"
                    />
                    {event.is_attendance_verified && (
                      <Typography variant="caption" color="text.secondary">
                        {event.attendance_verified_at && 
                          format(parseISO(event.attendance_verified_at), 'dd/MM/yyyy HH:mm')
                        }
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {event.is_attendance_verified ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                      <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                        Sudah melakukan daftar hadir
                      </Typography>
                    </Box>
                  ) : event.can_attend ? (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleShowToken(event)}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        },
                      }}
                    >
                      Daftar Hadir
                    </Button>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Schedule sx={{ color: 'warning.main', mb: 1 }} />
                      <Typography variant="body2" color="warning.main">
                        Belum saatnya daftar hadir
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Daftar hadir hanya bisa dilakukan pada hari H setelah jam kegiatan dimulai
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Token Dialog */}
      <Dialog open={showTokenDialog} onClose={() => setShowTokenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Daftar Hadir - {selectedEvent?.event_title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Masukkan token 10 digit yang telah dikirim ke email Anda untuk melakukan daftar hadir.
            </Alert>

            {selectedEvent && (
              <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Token Anda:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: 2 }}>
                    {selectedEvent.attendance_token}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopy />}
                    onClick={handleCopyToken}
                    color={copySuccess ? 'success' : 'primary'}
                  >
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </Button>
                </Box>
              </Paper>
            )}

            <TextField
              fullWidth
              label="Masukkan Token (10 digit)"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="1234567890"
              inputProps={{ maxLength: 10, style: { textAlign: 'center', fontSize: '1.2rem', letterSpacing: 2 } }}
              sx={{ mb: 2 }}
            />

            {verifyAttendanceMutation.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {(verifyAttendanceMutation.error as any).response?.data?.message || 'Gagal melakukan daftar hadir'}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTokenDialog(false)}>
            Batal
          </Button>
          <Button
            onClick={handleVerifyAttendance}
            variant="contained"
            disabled={tokenInput.length !== 10 || verifyAttendanceMutation.isPending}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {verifyAttendanceMutation.isPending ? <CircularProgress size={20} /> : 'Verifikasi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attendance;