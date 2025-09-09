import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Payment,
  Save,
  Science,
  CheckCircle,
  Error as ErrorIcon,
  Info,
  Security,
  Settings,
  AccountBalance,
  PhoneAndroid,
  CreditCard,
} from '@mui/icons-material';

interface PaymentSettings {
  xendit_secret_key: string;
  xendit_public_key: string;
  xendit_webhook_token: string;
  xendit_environment: 'sandbox' | 'production';
  payment_methods: {
    virtual_account: boolean;
    ewallet: boolean;
    credit_card: boolean;
  };
  virtual_account_banks: string[];
  ewallet_providers: string[];
  credit_card_providers: string[];
  payment_expiry_hours: number;
  auto_approve_payments: boolean;
  send_payment_notifications: boolean;
}

const PaymentSettings: React.FC = () => {
  const [settings, setSettings] = useState<PaymentSettings>({
    xendit_secret_key: '',
    xendit_public_key: '',
    xendit_webhook_token: '',
    xendit_environment: 'sandbox',
    payment_methods: {
      virtual_account: true,
      ewallet: true,
      credit_card: true,
    },
    virtual_account_banks: ['bca', 'mandiri', 'bni', 'bri'],
    ewallet_providers: ['gopay', 'ovo', 'dana', 'linkaja'],
    credit_card_providers: ['visa', 'mastercard', 'jcb'],
    payment_expiry_hours: 24,
    auto_approve_payments: true,
    send_payment_notifications: true,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${baseURL}/admin/payment-settings`, {
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
        setSettings(data.data);
      } else {
        setError(data.message || 'Gagal mengambil pengaturan payment');
      }
    } catch (err) {
      console.error('Payment settings error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Terjadi kesalahan saat mengambil pengaturan payment: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('auth_token');
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${baseURL}/admin/payment-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess('Pengaturan payment berhasil disimpan');
      } else {
        setError(data.message || 'Gagal menyimpan pengaturan payment');
      }
    } catch (err) {
      console.error('Save payment settings error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Terjadi kesalahan saat menyimpan pengaturan payment: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setError('');
      setTestResult(null);

      const token = localStorage.getItem('auth_token');
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${baseURL}/admin/payment-settings/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          xendit_secret_key: settings.xendit_secret_key,
          xendit_environment: settings.xendit_environment,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setTestResult({
          success: true,
          message: 'Koneksi ke Xendit berhasil',
          data: data.data,
        });
      } else {
        setTestResult({
          success: false,
          message: data.message || 'Koneksi ke Xendit gagal',
        });
      }
    } catch (err) {
      console.error('Test payment connection error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setTestResult({
        success: false,
        message: `Terjadi kesalahan saat testing koneksi: ${errorMessage}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePaymentMethodChange = (method: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      payment_methods: {
        ...prev.payment_methods,
        [method]: enabled,
      },
    }));
  };

  const bankOptions = [
    { value: 'bca', label: 'BCA' },
    { value: 'mandiri', label: 'Mandiri' },
    { value: 'bni', label: 'BNI' },
    { value: 'bri', label: 'BRI' },
    { value: 'permata', label: 'Permata' },
    { value: 'cimb', label: 'CIMB Niaga' },
  ];

  const ewalletOptions = [
    { value: 'gopay', label: 'GoPay' },
    { value: 'ovo', label: 'OVO' },
    { value: 'dana', label: 'DANA' },
    { value: 'linkaja', label: 'LinkAja' },
    { value: 'shopeepay', label: 'ShopeePay' },
  ];

  const creditCardOptions = [
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'Mastercard' },
    { value: 'jcb', label: 'JCB' },
    { value: 'amex', label: 'American Express' },
  ];

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
            <Settings sx={{ fontSize: 32, color: '#667eea' }} />
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Pengaturan Payment Gateway
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Konfigurasi Xendit dan metode pembayaran
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Xendit Configuration */}
            <Box>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security sx={{ color: '#667eea' }} />
                  Konfigurasi Xendit
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                    <FormControl fullWidth>
                      <InputLabel>Environment</InputLabel>
                      <Select
                        value={settings.xendit_environment}
                        onChange={(e) => handleInputChange('xendit_environment', e.target.value)}
                        label="Environment"
                      >
                        <MenuItem value="sandbox">Sandbox (Testing)</MenuItem>
                        <MenuItem value="production">Production (Live)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                    <TextField
                      fullWidth
                      label="Payment Expiry (Hours)"
                      type="number"
                      value={settings.payment_expiry_hours}
                      onChange={(e) => handleInputChange('payment_expiry_hours', parseInt(e.target.value))}
                      helperText="Berapa jam payment akan expired"
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 100%' }}>
                    <TextField
                      fullWidth
                      label="Xendit Secret Key"
                      type="password"
                      value={settings.xendit_secret_key}
                      onChange={(e) => handleInputChange('xendit_secret_key', e.target.value)}
                      helperText="Secret key dari Xendit dashboard"
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 100%' }}>
                    <TextField
                      fullWidth
                      label="Xendit Public Key"
                      value={settings.xendit_public_key}
                      onChange={(e) => handleInputChange('xendit_public_key', e.target.value)}
                      helperText="Public key dari Xendit dashboard"
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 100%' }}>
                    <TextField
                      fullWidth
                      label="Webhook Token"
                      type="password"
                      value={settings.xendit_webhook_token}
                      onChange={(e) => handleInputChange('xendit_webhook_token', e.target.value)}
                      helperText="Token untuk verifikasi webhook dari Xendit"
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 100%' }}>
                    <Button
                      variant="outlined"
                      startIcon={testing ? <CircularProgress size={20} /> : <Science />}
                      onClick={handleTestConnection}
                      disabled={testing || !settings.xendit_secret_key}
                    >
                      {testing ? 'Testing...' : 'Test Koneksi'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Payment Methods */}
            <Box>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Payment sx={{ color: '#667eea' }} />
                  Metode Pembayaran
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <AccountBalance sx={{ color: '#667eea' }} />
                          <Typography variant="h6">Virtual Account</Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.payment_methods.virtual_account}
                              onChange={(e) => handlePaymentMethodChange('virtual_account', e.target.checked)}
                            />
                          }
                          label="Aktifkan Virtual Account"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Bank yang tersedia:
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {settings.virtual_account_banks.map((bank) => (
                            <Chip
                              key={bank}
                              label={bankOptions.find(b => b.value === bank)?.label || bank}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                  
                  <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <PhoneAndroid sx={{ color: '#667eea' }} />
                          <Typography variant="h6">E-Wallet</Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.payment_methods.ewallet}
                              onChange={(e) => handlePaymentMethodChange('ewallet', e.target.checked)}
                            />
                          }
                          label="Aktifkan E-Wallet"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Provider yang tersedia:
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {settings.ewallet_providers.map((provider) => (
                            <Chip
                              key={provider}
                              label={ewalletOptions.find(p => p.value === provider)?.label || provider}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                  
                  <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <CreditCard sx={{ color: '#667eea' }} />
                          <Typography variant="h6">Credit Card</Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.payment_methods.credit_card}
                              onChange={(e) => handlePaymentMethodChange('credit_card', e.target.checked)}
                            />
                          }
                          label="Aktifkan Credit Card"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Provider yang tersedia:
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {settings.credit_card_providers.map((provider) => (
                            <Chip
                              key={provider}
                              label={creditCardOptions.find(p => p.value === provider)?.label || provider}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Additional Settings */}
            <Box>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Settings sx={{ color: '#667eea' }} />
                  Pengaturan Tambahan
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.auto_approve_payments}
                          onChange={(e) => handleInputChange('auto_approve_payments', e.target.checked)}
                        />
                      }
                      label="Auto Approve Pembayaran"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Otomatis approve event registration setelah pembayaran berhasil
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.send_payment_notifications}
                          onChange={(e) => handleInputChange('send_payment_notifications', e.target.checked)}
                        />
                      }
                      label="Kirim Notifikasi Pembayaran"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Kirim email notifikasi ke peserta setelah pembayaran
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Test Result */}
            {testResult && (
              <Box>
                <Alert
                  severity={testResult.success ? 'success' : 'error'}
                  icon={testResult.success ? <CheckCircle /> : <ErrorIcon />}
                >
                  <Typography variant="h6" gutterBottom>
                    {testResult.success ? 'Koneksi Berhasil' : 'Koneksi Gagal'}
                  </Typography>
                  <Typography variant="body2">
                    {testResult.message}
                  </Typography>
                  {testResult.data && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Informasi Akun:
                      </Typography>
                      <Typography variant="body2">
                        Environment: {testResult.data.environment}
                      </Typography>
                      <Typography variant="body2">
                        Status: {testResult.data.status}
                      </Typography>
                    </Box>
                  )}
                </Alert>
              </Box>
            )}

            {/* Save Button */}
            <Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={fetchSettings}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </Button>
              </Box>
            </Box>
              </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentSettings;
