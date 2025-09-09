import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle,
  Pending,
  Error,
  AccessTime,
  Payment,
  Event,
  Person,
  Schedule,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

interface PaymentData {
  id: number;
  payment_id: string;
  external_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_channel: string;
  expires_at: string;
  paid_at: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  event: {
    id: number;
    title: string;
    date: string;
    location: string;
  };
}

const PaymentStatus: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (paymentId) {
      fetchPaymentStatus();
    }
  }, [paymentId]);

  const fetchPaymentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payments/${paymentId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setPayment(data.data);
      } else {
        setError(data.message || 'Payment tidak ditemukan');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil status payment');
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
        return 'Berhasil Dibayar';
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'failed':
        return 'Pembayaran Gagal';
      case 'expired':
        return 'Pembayaran Kedaluwarsa';
      default:
        return 'Status Tidak Diketahui';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !payment) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Payment tidak ditemukan'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/events')}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          Kembali ke Events
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            {getStatusIcon(payment.status)}
            <Box>
              <Typography variant="h5">
                Status Pembayaran
              </Typography>
              <Chip
                label={getStatusText(payment.status)}
                color={getStatusColor(payment.status) as any}
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          {/* Payment Details */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Payment sx={{ color: '#667eea' }} />
              Detail Pembayaran
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <Payment />
                </ListItemIcon>
                <ListItemText
                  primary="ID Pembayaran"
                  secondary={payment.payment_id}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Payment />
                </ListItemIcon>
                <ListItemText
                  primary="Jumlah"
                  secondary={formatPrice(payment.amount)}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Payment />
                </ListItemIcon>
                <ListItemText
                  primary="Metode Pembayaran"
                  secondary={`${payment.payment_method} - ${payment.payment_channel}`}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Schedule />
                </ListItemIcon>
                <ListItemText
                  primary="Dibuat"
                  secondary={formatDate(payment.created_at)}
                />
              </ListItem>
              
              {payment.expires_at && (
                <ListItem>
                  <ListItemIcon>
                    <AccessTime />
                  </ListItemIcon>
                  <ListItemText
                    primary="Kedaluwarsa"
                    secondary={formatDate(payment.expires_at)}
                  />
                </ListItem>
              )}
              
              {payment.paid_at && (
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle />
                  </ListItemIcon>
                  <ListItemText
                    primary="Dibayar"
                    secondary={formatDate(payment.paid_at)}
                  />
                </ListItem>
              )}
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Event Details */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Event sx={{ color: '#667eea' }} />
              Detail Event
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="Nama Event"
                  secondary={payment.event.title}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Tanggal"
                  secondary={formatDate(payment.event.date)}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Lokasi"
                  secondary={payment.event.location}
                />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* User Details */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ color: '#667eea' }} />
              Detail Peserta
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="Nama"
                  secondary={payment.user.name}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Email"
                  secondary={payment.user.email}
                />
              </ListItem>
            </List>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {payment.status === 'pending' && (
              <Button
                variant="contained"
                onClick={fetchPaymentStatus}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Refresh Status
              </Button>
            )}
            
            <Button
              variant="outlined"
              onClick={() => navigate('/my-events')}
            >
              Lihat Event Saya
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/events')}
            >
              Kembali ke Events
            </Button>
          </Box>

          {/* Status Messages */}
          {payment.status === 'pending' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Pembayaran Anda sedang menunggu konfirmasi. Silakan lakukan pembayaran sesuai dengan instruksi yang diberikan.
            </Alert>
          )}
          
          {payment.status === 'paid' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Pembayaran berhasil! Anda telah terdaftar untuk event ini. Silakan cek email untuk konfirmasi lebih lanjut.
            </Alert>
          )}
          
          {payment.status === 'failed' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Pembayaran gagal. Silakan coba lagi atau gunakan metode pembayaran lain.
            </Alert>
          )}
          
          {payment.status === 'expired' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Pembayaran telah kedaluwarsa. Silakan buat pembayaran baru untuk event ini.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentStatus;
