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
  Grid,
} from '@mui/material';
import {
  Save,
  Cancel,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { EventFormData } from '../../types';

const schema = yup.object().shape({
  title: yup.string().required('Judul event wajib diisi'),
  description: yup.string().required('Deskripsi event wajib diisi'),
  date: yup.string().required('Tanggal event wajib diisi'),
  time: yup.string().required('Waktu event wajib diisi'),
  location: yup.string().required('Lokasi event wajib diisi'),
  max_participants: yup.number().min(1, 'Minimal 1 peserta').required('Maksimal peserta wajib diisi'),
});

interface EventFormProps {
  isCreate?: boolean;
  isEdit?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ isCreate = false, isEdit = false }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      max_participants: 50,
    },
  });

  const handleSave = async (data: EventFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement save logic
      console.log('Saving event:', data);
      navigate('/admin/events');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan event. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/events');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {isCreate ? 'Tambah Event Baru' : 'Edit Event'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {isCreate ? 'Buat event baru untuk ditampilkan di platform' : 'Edit informasi event'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(handleSave)}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Judul Event"
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Deskripsi Event"
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Box>

              <Box>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Tanggal Event"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.date}
                      helperText={errors.date?.message}
                    />
                  )}
                />
              </Box>

              <Box>
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Waktu Event"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.time}
                      helperText={errors.time?.message}
                    />
                  )}
                />
              </Box>

              <Box>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Lokasi Event"
                      error={!!errors.location}
                      helperText={errors.location?.message}
                    />
                  )}
                />
              </Box>

              <Box>
                <Controller
                  name="max_participants"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Maksimal Peserta"
                      type="number"
                      error={!!errors.max_participants}
                      helperText={errors.max_participants?.message}
                    />
                  )}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={20} /> : 'Simpan'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default EventForm;
