import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  supportEmail: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoBackup: boolean;
  backupFrequency: string;
  maintenanceMode: boolean;
  debugMode: boolean;
  timezone: string;
  dateFormat: string;
  language: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'EventHub',
    siteDescription: 'Platform Event Management Terdepan',
    adminEmail: 'admin@eventhub.com',
    supportEmail: 'support@eventhub.com',
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    backupFrequency: 'daily',
    maintenanceMode: false,
    debugMode: false,
    timezone: 'Asia/Jakarta',
    dateFormat: 'DD/MM/YYYY',
    language: 'id',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbar({
        open: true,
        message: 'Pengaturan berhasil disimpan',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Gagal menyimpan pengaturan',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSnackbar({
        open: true,
        message: 'Backup berhasil dibuat',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Gagal membuat backup',
        severity: 'error'
      });
    }
  };

  const handleRestore = async () => {
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSnackbar({
        open: true,
        message: 'Restore berhasil dilakukan',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Gagal melakukan restore',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3, minHeight: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              Pengaturan Sistem
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Konfigurasi sistem dan pengaturan EventHub
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {}}
            >
              Reset Default
            </Button>
            <Button
              variant="contained"
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSaveSettings}
              disabled={isLoading}
              sx={{ bgcolor: 'primary.main' }}
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
        gap: 3 
      }}>
        {/* General Settings */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <SettingsIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Pengaturan Umum
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Nama Situs"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                fullWidth
              />
              
              <TextField
                label="Deskripsi Situs"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
              
              <TextField
                label="Email Admin"
                value={settings.adminEmail}
                onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                fullWidth
                type="email"
              />
              
              <TextField
                label="Email Support"
                value={settings.supportEmail}
                onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                fullWidth
                type="email"
              />
            </Box>
          </CardContent>
        </Card>

        {/* File & Storage Settings */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <StorageIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                File & Storage
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Ukuran File Maksimal (MB)"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                fullWidth
                type="number"
              />
              
              <TextField
                label="Tipe File yang Diizinkan"
                value={settings.allowedFileTypes.join(', ')}
                onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value.split(', '))}
                fullWidth
                helperText="Pisahkan dengan koma (contoh: jpg, png, pdf)"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <NotificationsIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Pengaturan Notifikasi
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                }
                label="Notifikasi Email"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsNotifications}
                    onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  />
                }
                label="Notifikasi SMS"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Backup & Maintenance */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <BackupIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Backup & Maintenance
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoBackup}
                    onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                  />
                }
                label="Auto Backup"
              />
              
              <FormControl fullWidth>
                <InputLabel>Frekuensi Backup</InputLabel>
                <Select
                  value={settings.backupFrequency}
                  onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                  label="Frekuensi Backup"
                >
                  <MenuItem value="daily">Harian</MenuItem>
                  <MenuItem value="weekly">Mingguan</MenuItem>
                  <MenuItem value="monthly">Bulanan</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<BackupIcon />}
                  onClick={handleBackup}
                  fullWidth
                >
                  Buat Backup
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RestoreIcon />}
                  onClick={handleRestore}
                  fullWidth
                >
                  Restore
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <SecurityIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Konfigurasi Sistem
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  />
                }
                label="Mode Maintenance"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.debugMode}
                    onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                  />
                }
                label="Mode Debug"
              />
              
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  label="Timezone"
                >
                  <MenuItem value="Asia/Jakarta">Asia/Jakarta (WIB)</MenuItem>
                  <MenuItem value="Asia/Makassar">Asia/Makassar (WITA)</MenuItem>
                  <MenuItem value="Asia/Jayapura">Asia/Jayapura (WIT)</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Format Tanggal</InputLabel>
                <Select
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  label="Format Tanggal"
                >
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Bahasa</InputLabel>
                <Select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  label="Bahasa"
                >
                  <MenuItem value="id">Bahasa Indonesia</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* System Status */}
        <Box sx={{ gridColumn: { xs: '1', lg: '1 / -1' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Status Sistem
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2 
              }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <CheckIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" color="success.main">
                    Database
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connected
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <CheckIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" color="success.main">
                    Email Service
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <WarningIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" color="warning.main">
                    Storage
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    75% Used
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <InfoIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" color="info.main">
                    Last Backup
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    2 hours ago
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Box>
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

export default Settings;
