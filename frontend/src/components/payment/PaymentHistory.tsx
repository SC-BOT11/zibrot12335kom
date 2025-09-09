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
} from '@mui/material';
import {
  Visibility,
  Payment,
  Event,
  AccessTime,
  CheckCircle,
  Error,
  Pending,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface PaymentHistoryItem {
  id: number;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_channel: string;
  created_at: string;
  paid_at: string | null;
  event: {
    id: number;
    title: string;
    date: string;
  };
}

const PaymentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    fetchPaymentHistory();
  }, [currentPage]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payments/history?page=${currentPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setPayments(data.data.data);
        setTotalPages(data.data.last_page);
      } else {
        setError(data.message || 'Gagal mengambil riwayat pembayaran');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil riwayat pembayaran');
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

  const handleViewPayment = (paymentId: string) => {
    navigate(`/payment/${paymentId}`);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
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
                Riwayat Pembayaran
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Daftar semua pembayaran event yang pernah Anda lakukan
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {payments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Belum Ada Riwayat Pembayaran
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Anda belum melakukan pembayaran untuk event apapun
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/events')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Lihat Events
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow>
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
                              onClick={() => handleViewPayment(payment.payment_id)}
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
    </Box>
  );
};

export default PaymentHistory;
