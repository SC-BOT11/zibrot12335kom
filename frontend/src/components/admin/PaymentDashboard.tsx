import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Payment,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Pending,
  Error as ErrorIcon,
  AccessTime,
  AccountBalance,
  PhoneAndroid,
  CreditCard,
  MonetizationOn,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

interface PaymentStats {
  total_payments: number;
  total_amount: number;
  successful_payments: number;
  pending_payments: number;
  failed_payments: number;
  expired_payments: number;
  success_rate: number;
  average_payment_amount: number;
  payment_methods_stats: {
    virtual_account: number;
    ewallet: number;
    credit_card: number;
  };
  daily_payments: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
  monthly_payments: Array<{
    month: string;
    count: number;
    amount: number;
  }>;
  recent_payments: Array<{
    id: number;
    payment_id: string;
    amount: number;
    status: string;
    payment_method: string;
    user_name: string;
    event_title: string;
    created_at: string;
  }>;
}

const PaymentDashboard: React.FC = () => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('30');

  useEffect(() => {
    fetchPaymentStats();
  }, [timeRange]);

  const fetchPaymentStats = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('auth_token');
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${baseURL}/admin/payment-stats?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Set default values if data is empty
        const statsData = data.data || {};
        setStats({
          total_payments: statsData.total_payments || 0,
          total_amount: statsData.total_amount || 0,
          successful_payments: statsData.successful_payments || 0,
          pending_payments: statsData.pending_payments || 0,
          failed_payments: statsData.failed_payments || 0,
          expired_payments: statsData.expired_payments || 0,
          success_rate: statsData.success_rate || 0,
          average_payment_amount: statsData.average_payment_amount || 0,
          payment_methods_stats: statsData.payment_methods_stats || {
            virtual_account: 0,
            ewallet: 0,
            credit_card: 0,
          },
          daily_payments: statsData.daily_payments || [],
          monthly_payments: statsData.monthly_payments || [],
          recent_payments: statsData.recent_payments || [],
        });
      } else {
        setError(data.message || 'Gagal mengambil statistik payment');
      }
    } catch (err) {
      console.error('Payment stats error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Terjadi kesalahan saat mengambil statistik payment: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Pending color="warning" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'expired':
        return <AccessTime color="error" />;
      default:
        return <Pending color="warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Berhasil';
      case 'pending':
        return 'Menunggu';
      case 'failed':
        return 'Gagal';
      case 'expired':
        return 'Kedaluwarsa';
      default:
        return 'Tidak Diketahui';
    }
  };

  const paymentMethodData = stats ? [
    { name: 'Virtual Account', value: stats.payment_methods_stats.virtual_account, color: '#667eea' },
    { name: 'E-Wallet', value: stats.payment_methods_stats.ewallet, color: '#764ba2' },
    { name: 'Credit Card', value: stats.payment_methods_stats.credit_card, color: '#f093fb' },
  ] : [];

  const statusData = stats ? [
    { name: 'Berhasil', value: stats.successful_payments, color: '#4caf50' },
    { name: 'Menunggu', value: stats.pending_payments, color: '#ff9800' },
    { name: 'Gagal', value: stats.failed_payments, color: '#f44336' },
    { name: 'Kedaluwarsa', value: stats.expired_payments, color: '#9e9e9e' },
  ] : [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          Tidak ada data payment yang tersedia. Data akan muncul setelah ada transaksi payment.
        </Alert>
      </Box>
    );
  }

  // Check if all stats are zero (no payment data)
  const hasNoData = stats.total_payments === 0 && stats.total_amount === 0;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Payment sx={{ fontSize: 32, color: '#667eea' }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Dashboard Pembayaran
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Statistik dan analisis pembayaran event
          </Typography>
        </Box>
      </Box>

      {hasNoData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Belum ada data transaksi payment. Dashboard akan menampilkan statistik setelah ada transaksi payment.
        </Alert>
      )}

      {/* Time Range Selector */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Periode</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Periode"
          >
            <MenuItem value="7">7 Hari</MenuItem>
            <MenuItem value="30">30 Hari</MenuItem>
            <MenuItem value="90">90 Hari</MenuItem>
            <MenuItem value="365">1 Tahun</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, bgcolor: '#667eea', borderRadius: 2 }}>
                  <Payment sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total_payments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Pembayaran
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, bgcolor: '#4caf50', borderRadius: 2 }}>
                  <MonetizationOn sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatPrice(stats.total_amount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Pendapatan
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, bgcolor: '#ff9800', borderRadius: 2 }}>
                  <TrendingUp sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.success_rate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tingkat Keberhasilan
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, bgcolor: '#9c27b0', borderRadius: 2 }}>
                  <TrendingDown sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatPrice(stats.average_payment_amount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rata-rata Pembayaran
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        {/* Daily Payments Chart */}
        <Box sx={{ flex: '2 1 600px', minWidth: '400px' }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trend Pembayaran Harian
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.daily_payments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="count"
                    stroke="#667eea"
                    strokeWidth={2}
                    name="Jumlah Pembayaran"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="amount"
                    stroke="#764ba2"
                    strokeWidth={2}
                    name="Total Amount"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Payment Methods Pie Chart */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Metode Pembayaran
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Status Distribution and Recent Payments */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Status Distribution */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribusi Status Pembayaran
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Payments */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pembayaran Terbaru
              </Typography>
              <List>
                {stats.recent_payments.map((payment) => (
                  <ListItem key={payment.id} divider>
                    <ListItemIcon>
                      {getStatusIcon(payment.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {payment.user_name}
                          </Typography>
                          <Chip
                            label={getStatusText(payment.status)}
                            color={getStatusColor(payment.status) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {payment.event_title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatPrice(payment.amount)} • {payment.payment_method} • {formatDate(payment.created_at)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentDashboard;
