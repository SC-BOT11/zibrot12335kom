import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, Search, CalendarToday, LocationOn, People, Sort, FilterList } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_asc');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch events data
  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['events', searchTerm, sortBy, statusFilter],
    queryFn: () => api.get('/events', {
      params: {
        search: searchTerm,
        sort: sortBy,
        status: statusFilter,
      }
    }),
    select: (response: any) => response.data.data,
  });

  // Process events data
  const events = React.useMemo(() => {
    if (!eventsData) return [];
    
    return eventsData.map((event: any) => {
      const eventDate = parseISO(event.date);
      const now = new Date();
      
      let status = 'Upcoming';
      if (isToday(eventDate)) {
        status = 'Today';
      } else if (isBefore(eventDate, now)) {
        status = 'Completed';
      }
      
      return {
        ...event,
        status,
        formattedDate: format(eventDate, 'MMM dd, yyyy'),
        formattedTime: `${event.start_time} - ${event.end_time}`,
      };
    });
  }, [eventsData]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
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
          Gagal memuat data events. Silakan coba lagi.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Katalog Kegiatan
      </Typography>

      {/* Search and Filter Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              placeholder="Cari kegiatan berdasarkan kata kunci..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search />,
              }}
            />
          </Box>
          <Box sx={{ minWidth: { xs: '100%', md: '200px' } }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Tambah Kegiatan
            </Button>
          </Box>
        </Box>

        {/* Filter and Sort Controls */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Urutkan Berdasarkan</InputLabel>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              label="Urutkan Berdasarkan"
              startAdornment={<Sort sx={{ mr: 1 }} />}
            >
              <MenuItem value="date_asc">Waktu Terdekat</MenuItem>
              <MenuItem value="date_desc">Waktu Terjauh</MenuItem>
              <MenuItem value="title_asc">Judul A-Z</MenuItem>
              <MenuItem value="title_desc">Judul Z-A</MenuItem>
              <MenuItem value="participants_desc">Peserta Terbanyak</MenuItem>
              <MenuItem value="participants_asc">Peserta Tersedikit</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
              startAdornment={<FilterList sx={{ mr: 1 }} />}
            >
              <MenuItem value="all">Semua</MenuItem>
              <MenuItem value="upcoming">Mendatang</MenuItem>
              <MenuItem value="ongoing">Berlangsung</MenuItem>
              <MenuItem value="completed">Selesai</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            {events.length} kegiatan ditemukan
          </Typography>
        </Box>
      </Box>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Tidak ada kegiatan yang ditemukan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Coba ubah kata kunci pencarian atau filter yang digunakan
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {events.map((event: any) => (
            <Card key={event.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, lineHeight: 1.3 }}>
                  {event.title}
                </Typography>
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: '#667eea', fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.formattedDate}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: '#667eea', fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.formattedTime}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ mr: 1, color: '#f093fb', fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <People sx={{ mr: 1, color: '#4facfe', fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.current_participants || 0} peserta
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <Chip
                    label={event.status}
                    color={
                      event.status === 'Upcoming' ? 'primary' : 
                      event.status === 'Today' ? 'warning' : 
                      'success'
                    }
                    size="small"
                    sx={{
                      backgroundColor: 
                        event.status === 'Upcoming' ? '#667eea' : 
                        event.status === 'Today' ? '#ff9800' : 
                        '#4caf50',
                      color: 'white',
                    }}
                  />
                  <Button 
                    size="small" 
                    sx={{ 
                      color: '#667eea',
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Lihat Detail
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Events;
