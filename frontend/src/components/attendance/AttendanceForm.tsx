import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  QrCode,
  CheckCircle,
  Error,
  Schedule,
  Event,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { eventService } from '../../services/api';

const schema = yup.object().shape({
  attendance_token: yup.string().required('Token kehadiran wajib diisi'),
});

interface AttendanceFormData {
  attendance_token: string;
}

const AttendanceForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AttendanceFormData>({
    resolver: yupResolver(schema),
  });

  const attendanceMutation = useMutation({
    mutationFn: (data: AttendanceFormData) => eventService.markAttendance(data),
    onSuccess: () => {
      setSuccess('Kehadiran berhasil dicatat! Anda akan menerima sertifikat setelah event selesai.');
      reset();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Gagal mencatat kehadiran. Silakan coba lagi.');
    },
  });

  const handleAttendance = async (data: AttendanceFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await attendanceMutation.mutateAsync(data);
    } catch (error) {
      console.error('Attendance marking failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <QrCode sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Daftar Hadir
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Masukkan token kehadiran yang telah dikirim ke email Anda
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit(handleAttendance)}>
            <Controller
              name="attendance_token"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Token Kehadiran"
                  placeholder="Masukkan token 10 digit"
                  error={!!errors.attendance_token}
                  helperText={errors.attendance_token?.message}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCode color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mb: 3 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Catat Kehadiran'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }} />

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Informasi Penting:
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Schedule color="primary" />
                <Typography variant="body2">
                  Token kehadiran hanya berlaku pada hari event
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Event color="primary" />
                <Typography variant="body2">
                  Pastikan Anda hadir tepat waktu untuk mendapatkan sertifikat
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle color="primary" />
                <Typography variant="body2">
                  Kehadiran akan diverifikasi oleh panitia
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Box>
    </Container>
  );
};

export default AttendanceForm;
