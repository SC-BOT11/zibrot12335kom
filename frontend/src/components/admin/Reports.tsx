import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Event as EventIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { dashboardService } from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface ReportData {
  period: string;
  events: number;
  participants: number;
  revenue: number;
  certificates: number;
}

interface TopEvent {
  title: string;
  participants: number;
  revenue: number;
  status: 'completed' | 'upcoming';
}

const Reports: React.FC = () => {
  const [period, setPeriod] = useState('monthly');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [isExporting, setIsExporting] = useState(false);

  // Mock data for demonstration - Website baru, data kosong
  const mockData = {
    monthlyStats: [
      { month: 'Jan', events: 0, participants: 0, revenue: 0, certificates: 0 },
      { month: 'Feb', events: 0, participants: 0, revenue: 0, certificates: 0 },
      { month: 'Mar', events: 0, participants: 0, revenue: 0, certificates: 0 },
      { month: 'Apr', events: 0, participants: 0, revenue: 0, certificates: 0 },
      { month: 'May', events: 0, participants: 0, revenue: 0, certificates: 0 },
      { month: 'Jun', events: 0, participants: 0, revenue: 0, certificates: 0 },
    ],
    eventCategories: [
      { name: 'Belum ada event', value: 100, color: '#e0e0e0' },
    ],
    topEvents: [] as TopEvent[],
    participantStats: {
      total: 0,
      verified: 0,
      unverified: 0,
      active: 0,
      suspended: 0,
    },
    revenueStats: {
      total: 0,
      monthly: 0,
      growth: 0,
      target: 0,
    }
  };

  const handleExport = async (type: string, format: 'xlsx' | 'csv' | 'pdf') => {
    try {
      setIsExporting(true);
      setSnackbar({
        open: true,
        message: `Sedang mengexport laporan ${type}...`,
        severity: 'info'
      });

      let exportType: 'events' | 'participants' | 'users';
      
      // Map export types to backend endpoints
      switch (type) {
        case 'Events':
          exportType = 'events';
          break;
        case 'Participants':
          exportType = 'participants';
          break;
        case 'Revenue':
        case 'Certificates':
          exportType = 'users'; // Fallback for now
          break;
        default:
          exportType = 'events';
      }

      // Call backend export API
      const blob = await dashboardService.exportData(exportType, format === 'pdf' ? 'xlsx' : format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on type and format
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `laporan_${type.toLowerCase()}_${timestamp}.${format === 'pdf' ? 'xlsx' : format}`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: `Laporan ${type} berhasil diexport ke ${format.toUpperCase()} dan didownload`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: `Gagal export laporan ${type}: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`,
        severity: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3, minHeight: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              Laporan & Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor performa dan generate laporan lengkap EventHub
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Periode</InputLabel>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                label="Periode"
              >
                <MenuItem value="weekly">Mingguan</MenuItem>
                <MenuItem value="monthly">Bulanan</MenuItem>
                <MenuItem value="quarterly">Kuartalan</MenuItem>
                <MenuItem value="yearly">Tahunan</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Refresh Data">
              <IconButton onClick={() => {}} sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3, 
        mb: 4 
      }}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {mockData.participantStats.total}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Peserta
                </Typography>
              </Box>
              <PeopleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {mockData.revenueStats.total / 1000000}M
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Revenue
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {mockData.monthlyStats.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Events
                </Typography>
              </Box>
              <EventIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {mockData.participantStats.verified}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Peserta Terverifikasi
                </Typography>
              </Box>
              <CheckIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Section */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 3, 
        mb: 4 
      }}>
        {/* Monthly Trends */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Trend Bulanan - Events & Peserta
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockData.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Area 
                  type="monotone" 
                  dataKey="events" 
                  stroke="#667eea" 
                  fill="#667eea" 
                  fillOpacity={0.3}
                  yAxisId="left"
                />
                <Area 
                  type="monotone" 
                  dataKey="participants" 
                  stroke="#f093fb" 
                  fill="#f093fb" 
                  fillOpacity={0.3}
                  yAxisId="right"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Categories */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Kategori Event
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.eventCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockData.eventCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Revenue Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Revenue Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="revenue" fill="#43e97b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Events & Export Options */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 3 
      }}>
        {/* Top Events */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Top Events Berdasarkan Peserta
            </Typography>
                         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
               {mockData.topEvents.length > 0 ? (
                 mockData.topEvents.map((event, index) => (
                   <Paper key={index} sx={{ p: 2, bgcolor: 'background.default' }}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <Box sx={{ flex: 1 }}>
                         <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                           {event.title}
                         </Typography>
                         <Box sx={{ display: 'flex', gap: 3 }}>
                           <Typography variant="caption" color="text.secondary">
                             <PeopleIcon sx={{ fontSize: 14, mr: 0.5 }} />
                             {event.participants} peserta
                           </Typography>
                           <Typography variant="caption" color="text.secondary">
                             <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5 }} />
                             {formatCurrency(event.revenue)}
                           </Typography>
                         </Box>
                       </Box>
                       <Chip
                         label={event.status === 'completed' ? 'Selesai' : 'Akan Datang'}
                         color={event.status === 'completed' ? 'success' : 'warning'}
                         size="small"
                       />
                     </Box>
                   </Paper>
                 ))
               ) : (
                 <Box sx={{ textAlign: 'center', py: 4 }}>
                   <Typography variant="body1" color="text.secondary">
                     Belum ada event yang tersedia
                   </Typography>
                   <Typography variant="caption" color="text.secondary">
                     Event akan muncul di sini setelah ditambahkan
                   </Typography>
                 </Box>
               )}
             </Box>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Export Laporan
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('Events', 'xlsx')}
                fullWidth
                disabled={isExporting}
              >
                {isExporting ? 'Mengexport...' : 'Laporan Events (XLSX)'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('Participants', 'xlsx')}
                fullWidth
                disabled={isExporting}
              >
                {isExporting ? 'Mengexport...' : 'Laporan Peserta (XLSX)'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('Revenue', 'xlsx')}
                fullWidth
                disabled={isExporting}
              >
                {isExporting ? 'Mengexport...' : 'Laporan Revenue (XLSX)'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('Certificates', 'xlsx')}
                fullWidth
                disabled={isExporting}
              >
                {isExporting ? 'Mengexport...' : 'Laporan Sertifikat (XLSX)'}
              </Button>
              <Divider sx={{ my: 1 }} />
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('Comprehensive', 'pdf')}
                fullWidth
                sx={{ bgcolor: 'primary.main' }}
                disabled={isExporting}
              >
                {isExporting ? 'Mengexport...' : 'Laporan Lengkap (PDF)'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

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

export default Reports;
