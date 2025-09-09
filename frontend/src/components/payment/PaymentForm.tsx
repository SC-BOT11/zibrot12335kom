import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import {
  AccountBalance,
  CreditCard,
  PhoneAndroid,
  Payment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface PaymentFormProps {
  event: {
    id: number;
    title: string;
    price: number;
    date: string;
    location: string;
  };
  onPaymentSuccess?: (paymentData: any) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ event, onPaymentSuccess }) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentChannel, setPaymentChannel] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const paymentMethods = [
    {
      id: 'virtual_account',
      name: 'Virtual Account',
      icon: <AccountBalance />,
      channels: [
        { id: 'bca', name: 'BCA Virtual Account' },
        { id: 'mandiri', name: 'Mandiri Virtual Account' },
        { id: 'bni', name: 'BNI Virtual Account' },
        { id: 'bri', name: 'BRI Virtual Account' },
      ],
    },
    {
      id: 'ewallet',
      name: 'E-Wallet',
      icon: <PhoneAndroid />,
      channels: [
        { id: 'gopay', name: 'GoPay' },
        { id: 'ovo', name: 'OVO' },
        { id: 'dana', name: 'DANA' },
        { id: 'linkaja', name: 'LinkAja' },
      ],
    },
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: <CreditCard />,
      channels: [
        { id: 'visa', name: 'Visa' },
        { id: 'mastercard', name: 'Mastercard' },
        { id: 'jcb', name: 'JCB' },
      ],
    },
  ];

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    setPaymentChannel('');
  };

  const handlePaymentChannelChange = (channel: string) => {
    setPaymentChannel(channel);
  };

  const handleSubmit = async () => {
    if (!paymentMethod || !paymentChannel) {
      setError('Pilih metode pembayaran dan channel');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_id: event.id,
          payment_method: paymentMethod,
          payment_channel: paymentChannel,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (onPaymentSuccess) {
          onPaymentSuccess(data.data);
        } else {
          // Redirect to payment page
          navigate(`/payment/${data.data.payment.payment_id}`);
        }
      } else {
        setError(data.message || 'Gagal membuat payment');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memproses payment');
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

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Payment sx={{ color: '#667eea' }} />
            Pembayaran Event
          </Typography>

          {/* Event Details */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              {event.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              📅 {new Date(event.date).toLocaleDateString('id-ID')}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              📍 {event.location}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography variant="h6" color="primary">
                {formatPrice(event.price)}
              </Typography>
              {event.price === 0 && (
                <Chip label="Gratis" color="success" size="small" />
              )}
            </Box>
          </Box>

          {event.price === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Event ini gratis! Klik tombol di bawah untuk langsung mendaftar.
            </Alert>
          ) : (
            <>
              <Divider sx={{ my: 2 }} />

              {/* Payment Method Selection */}
              <Typography variant="h6" gutterBottom>
                Pilih Metode Pembayaran
              </Typography>

              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                >
                  {paymentMethods.map((method) => (
                    <Box key={method.id} sx={{ mb: 2 }}>
                      <FormControlLabel
                        value={method.id}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {method.icon}
                            <Typography>{method.name}</Typography>
                          </Box>
                        }
                      />
                      
                      {paymentMethod === method.id && (
                        <Box sx={{ ml: 4, mt: 1 }}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">Pilih Channel:</FormLabel>
                            <RadioGroup
                              value={paymentChannel}
                              onChange={(e) => handlePaymentChannelChange(e.target.value)}
                            >
                              {method.channels.map((channel) => (
                                <FormControlLabel
                                  key={channel.id}
                                  value={channel.id}
                                  control={<Radio size="small" />}
                                  label={channel.name}
                                />
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </Box>
                      )}
                    </Box>
                  ))}
                </RadioGroup>
              </FormControl>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
            </>
          )}

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={loading || (event.price > 0 && (!paymentMethod || !paymentChannel))}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : event.price === 0 ? (
              'Daftar Event Gratis'
            ) : (
              'Lanjutkan Pembayaran'
            )}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentForm;
