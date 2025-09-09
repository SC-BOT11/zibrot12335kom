import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Pagination,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
} from '@mui/material';
import {
  Visibility,
  Payment,
  Event,
  Person,
  AccessTime,
  CheckCircle,
  Error,
  Pending,
  Refresh,
  FilterList,
  Search,
} from '@mui/icons-material';

interface PaymentData {
  id: number;
  payment_id: string;
  external_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_channel: string;
  created_at: string;
  paid_at: string | null;
  expires_at: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
  event: {
    id: number;
    title: string;
    date: string;
  };
}

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [detailDialog, setDetailDialog] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchPayments();
  }, [currentPage, filterStatus, filterMethod, searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        status: filterStatus,
        method: filterMethod,
        search: searchTerm,
      });

      const response = await fetch(`/api/admin/payments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setPayments(data.data.data);
        setTotalPages(data.data.last_page);
      } else {
        setError(data.message || 'Gagal mengambil data pembayaran');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Pending color="warning" />;
      case 'failed':
        return <Error color="error" />;
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewPayment = (payment: PaymentData) => {
    setSelectedPayment(payment);
    setDetailDialog(true);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    fetchPayments();
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === 'status') {
      setFilterStatus(value);
    } else if (type === 'method') {
      setFilterMethod(value);
    }
    setCurrentPage(1);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Payment sx={{ fontSize: 32, color: '#667eea' }} />
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Manajemen Pembayaran
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Kelola semua pembayaran event dari peserta
              </Typography>
            </Box>
          </Box>

          {/* Filters and Search */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  placeholder="Cari pembayaran..."
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">Semua Status</MenuItem>
                    <MenuItem value="pending">Menunggu</MenuItem>
                    <MenuItem value="paid">Berhasil</MenuItem>
                    <MenuItem value="failed">Gagal</MenuItem>
                    <MenuItem value="expired">Kedaluwarsa</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <FormControl fullWidth>
                  <InputLabel>Metode</InputLabel>
                  <Select
                    value={filterMethod}
                    onChange={(e) => handleFilterChange('method', e.target.value)}
                    label="Metode"
                  >
                    <MenuItem value="all">Semua Metode</MenuItem>
                    <MenuItem value="virtual_account">Virtual Account</MenuItem>
                    <MenuItem value="ewallet">E-Wallet</MenuItem>
                    <MenuItem value="credit_card">Credit Card</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleRefresh}
                  fullWidth
                >
                  Refresh
                </Button>
              </Box>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {payments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Payment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Tidak Ada Data Pembayaran
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Belum ada pembayaran yang tercatat
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID Pembayaran</TableCell>
                      <TableCell>Peserta</TableCell>
                      <TableCell>Event</TableCell>
                      <TableCell>Jumlah</TableCell>
                      <TableCell>Metode</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Tanggal</TableCell>
                      <TableCell align="center">Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {payment.payment_id}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {payment.external_id}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {payment.user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {payment.user.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {payment.event.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(payment.event.date)}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {formatPrice(payment.amount)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {payment.payment_method}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {payment.payment_channel}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(payment.status)}
                            <Chip
                              label={getStatusText(payment.status)}
                              color={getStatusColor(payment.status) as any}
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {formatDate(payment.created_at)}
                            </Typography>
                            {payment.paid_at && (
                              <Typography variant="caption" color="text.secondary">
                                Dibayar: {formatDate(payment.paid_at)}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        
                        <TableCell align="center">
                          <Tooltip title="Lihat Detail">
                            <IconButton
                              onClick={() => handleViewPayment(payment)}
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Payment sx={{ color: '#667eea' }} />
            Detail Pembayaran
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Typography variant="h6" gutterBottom>
                    Informasi Pembayaran
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      ID Pembayaran
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedPayment.payment_id}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      External ID
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedPayment.external_id}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Jumlah
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatPrice(selectedPayment.amount)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(selectedPayment.status)}
                      <Chip
                        label={getStatusText(selectedPayment.status)}
                        color={getStatusColor(selectedPayment.status) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Typography variant="h6" gutterBottom>
                    Informasi Peserta
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nama
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedPayment.user.name}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedPayment.user.email}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Event
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedPayment.event.title}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tanggal Event
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatDate(selectedPayment.event.date)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Timeline Pembayaran
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Dibuat
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedPayment.created_at)}
                </Typography>
              </Box>
              {selectedPayment.paid_at && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Dibayar
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedPayment.paid_at)}
                  </Typography>
                </Box>
              )}
              {selectedPayment.expires_at && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Kedaluwarsa
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedPayment.expires_at)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentManagement;
