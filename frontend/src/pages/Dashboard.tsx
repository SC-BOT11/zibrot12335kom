import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Event,
  School,
  Download,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import LoadingOverlay from '../components/common/LoadingOverlay';

const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch dashboard statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats'),
    select: (response: any) => response.data.data,
  });

  // Fetch chart data
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard-charts', selectedYear],
    queryFn: () => api.get('/dashboard/chart-data', { params: { year: selectedYear } }),
    select: (response: any) => response.data.data,
  });

  // Prepare monthly data for charts
  const monthlyData = React.useMemo(() => {
    if (!chartData) return [];
    
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return months.map((month, index) => {
      const monthNumber = index + 1;
      const eventsData = (chartData as any)?.monthly_events?.find((item: any) => item.month === monthNumber);
      const participantsData = (chartData as any)?.monthly_participants?.find((item: any) => item.month === monthNumber);
      
      return {
        month,
        events: eventsData?.count || 0,
        participants: participantsData?.count || 0,
      };
    });
  }, [chartData]);

  // Prepare top events data
  const topEventsData = React.useMemo(() => {
    if (!(chartData as any)?.top_events) return [];
    
    return (chartData as any).top_events.map((event: any) => ({
      name: event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title,
      participants: event.event_participants_count || 0,
    }));
  }, [chartData]);

  const handleExportData = async () => {
    try {
      const response = await api.get('/dashboard/export', {
        params: { year: selectedYear },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard_data_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (statsLoading || chartLoading) {
    return (
      <Box sx={{ position: 'relative', minHeight: '50vh' }}>
        <LoadingOverlay 
          open={true}
          message="Memuat data dashboard..."
          variant="overlay"
          spinnerVariant="gradient"
        />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Dashboard Admin
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Tahun</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              label="Tahun"
            >
              <MenuItem value={2024}>2024</MenuItem>
              <MenuItem value={2023}>2023</MenuItem>
              <MenuItem value={2022}>2022</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportData}
            sx={{
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#5a6fd8',
                backgroundColor: 'rgba(102, 126, 234, 0.05)',
              },
            }}
          >
            Ekspor Data
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ height: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#667eea', mb: 1 }}>
                  {(statsData as any)?.total_events || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Total Kegiatan
                </Typography>
                <Chip
                  label="+12%"
                  size="small"
                  sx={{
                    backgroundColor: '#667eea',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                />
              </Box>
              <Avatar
                sx={{
                  backgroundColor: '#667eea15',
                  color: '#667eea',
                  width: 60,
                  height: 60,
                }}
              >
                <Event sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ height: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#f093fb', mb: 1 }}>
                  {(statsData as any)?.total_participants || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Total Peserta
                </Typography>
                <Chip
                  label="+8%"
                  size="small"
                  sx={{
                    backgroundColor: '#f093fb',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                />
              </Box>
              <Avatar
                sx={{
                  backgroundColor: '#f093fb15',
                  color: '#f093fb',
                  width: 60,
                  height: 60,
                }}
              >
                <People sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ height: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4facfe', mb: 1 }}>
                  {(statsData as any)?.total_certificates || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Sertifikat Terbit
                </Typography>
                <Chip
                  label="+15%"
                  size="small"
                  sx={{
                    backgroundColor: '#4facfe',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                />
              </Box>
              <Avatar
                sx={{
                  backgroundColor: '#4facfe15',
                  color: '#4facfe',
                  width: 60,
                  height: 60,
                }}
              >
                <School sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ height: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#43e97b', mb: 1 }}>
                  {(statsData as any)?.upcoming_events || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Kegiatan Mendatang
                </Typography>
                <Chip
                  label="+5%"
                  size="small"
                  sx={{
                    backgroundColor: '#43e97b',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                />
              </Box>
              <Avatar
                sx={{
                  backgroundColor: '#43e97b15',
                  color: '#43e97b',
                  width: 60,
                  height: 60,
                }}
              >
                <TrendingUp sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Charts Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Monthly Events Chart */}
          <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Jumlah Kegiatan Setiap Bulan ({selectedYear})
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="events" fill="#667eea" name="Kegiatan" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          {/* Monthly Participants Chart */}
          <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Jumlah Peserta Setiap Bulan ({selectedYear})
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="participants" fill="#f093fb" name="Peserta" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>

        {/* Top 10 Events Chart */}
        <Box>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              10 Kegiatan dengan Jumlah Peserta Terbanyak
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topEventsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={200} />
                <Tooltip />
                <Legend />
                <Bar dataKey="participants" fill="#4facfe" name="Jumlah Peserta" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
