import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  Fade,
  Slide,
  Grow,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  School,
  Edit,
  Save,
  Cancel,
  Security,
  Notifications,
  AutoAwesome,
  AccountCircle,
  VerifiedUser,
  CalendarToday,
  Logout,
  PhotoCamera,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    education: user?.education || '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(user?.profile_image || null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // Update user data in context
      if (user) {
        const updatedUser = { ...user, ...formData };
        // Here you would typically call an API to update the user
        // For now, we'll just update the local state
        
        // Update the user context to reflect changes immediately
        // This ensures the profile card shows updated information
        updateUser(updatedUser);
      }
      
      setSnackbar({
        open: true,
        message: 'Profil berhasil diperbarui!',
        severity: 'success',
      });
      setIsEditing(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Gagal memperbarui profil',
        severity: 'error',
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      education: user?.education || '',
    });
    setIsEditing(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const stats = [
    { label: 'Event Diikuti', value: '0', icon: <Person /> },
    { label: 'Sertifikat', value: '0', icon: <VerifiedUser /> },
    { label: 'Bergabung Sejak', value: '2025', icon: <CalendarToday /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Fade in timeout={1000}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                <AutoAwesome sx={{ fontSize: 48, mr: 2, color: 'primary.main' }} />
                <Typography variant="h3" component="h1" fontWeight="bold" color="primary">
                  Profil Saya
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary">
                Kelola informasi profil dan pengaturan akun Anda
              </Typography>
            </Box>
          </Fade>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          {/* Profile Card */}
          <Box>
            <Slide direction="up" in timeout={800}>
              <Card
                sx={{
                  p: 4,
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                    <Avatar
                      src={profileImage || undefined}
                      sx={{
                        width: 120,
                        height: 120,
                        fontSize: '3rem',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                      }}
                    >
                      {user?.name?.charAt(0) || 'U'}
                    </Avatar>
                    
                    {/* Upload Photo Button */}
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="profile-image-upload"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="profile-image-upload">
                      <IconButton
                        component="span"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        }}
                      >
                        <PhotoCamera />
                      </IconButton>
                    </label>
                    
                    <Chip
                      label="Verified"
                      color="success"
                      size="small"
                      icon={<VerifiedUser />}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>

                  <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom color="primary">
                    {user?.name || 'User Name'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {user?.email || 'user@example.com'}
                  </Typography>

                  <Divider sx={{ my: 3 }} />

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 2,
                    }}
                  >
                    {stats.map((stat, index) => (
                      <Box key={index}>
                        <Grow in timeout={1000 + index * 200}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{ color: 'primary.main', mb: 1 }}>
                              {stat.icon}
                            </Box>
                            <Typography variant="h6" component="div" fontWeight="bold" color="primary">
                              {stat.value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {stat.label}
                            </Typography>
                          </Box>
                        </Grow>
                      </Box>
                    ))}
                  </Box>



                  {/* Logout Button */}
                  <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<Logout />}
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      sx={{
                        py: 1.5,
                        borderWidth: 2,
                        fontWeight: 600,
                        '&:hover': {
                          borderWidth: 2,
                          backgroundColor: 'error.main',
                          color: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(244, 67, 54, 0.3)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Logout
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Slide>
          </Box>

          {/* Profile Form */}
          <Box sx={{ gridColumn: { xs: '1 / -1', md: '2 / -1' } }}>
            <Slide direction="right" in timeout={1200}>
              <Card
                sx={{
                  p: 4,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" component="h2" fontWeight="bold" color="primary">
                      Informasi Profil
                    </Typography>
                    <Box>
                      {!isEditing ? (
                        <Button
                          variant="contained"
                          startIcon={<Edit />}
                          onClick={() => setIsEditing(true)}
                          sx={{
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                            },
                          }}
                        >
                          Edit Profil
                        </Button>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleSave}
                            sx={{
                              background: 'linear-gradient(45deg, #11998e, #38ef7d)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #0f8a7a, #2dd66a)',
                              },
                            }}
                          >
                            Simpan
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={handleCancel}
                          >
                            Batal
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                      gap: 3,
                    }}
                  >
                    <Box>
                      <TextField
                        fullWidth
                        label="Nama Lengkap"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'primary.main' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={true} // Email tidak bisa diedit
                        variant="outlined"
                        InputProps={{
                          startAdornment: <Email sx={{ mr: 1, color: 'primary.main' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'rgba(0, 0, 0, 0.04)', // Background abu-abu untuk disabled field
                          },
                        }}
                        helperText="Email tidak dapat diubah"
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="Nomor Telepon"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={true} // Phone tidak bisa diedit
                        variant="outlined"
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: 'primary.main' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'rgba(0, 0, 0, 0.04)', // Background abu-abu untuk disabled field
                          },
                        }}
                        helperText="Nomor telepon tidak dapat diubah"
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="Pendidikan"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <School sx={{ mr: 1, color: 'primary.main' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
                      <TextField
                        fullWidth
                        label="Alamat"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        multiline
                        rows={3}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <LocationOn sx={{ mr: 1, color: 'primary.main' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Slide>
          </Box>
        </Box>

        {/* Settings Section */}
        <Box sx={{ mt: 6 }}>
          <Slide direction="up" in timeout={1400}>
            <Card
              sx={{
                p: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom color="primary">
                  Pengaturan Akun
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Kelola preferensi dan pengaturan akun Anda
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 4,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Security sx={{ color: 'primary.main', mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          Keamanan
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pengaturan keamanan akun
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        Ubah
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Notifications sx={{ color: 'primary.main', mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          Notifikasi Email
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Terima notifikasi via email
                        </Typography>
                      </Box>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label=""
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <AccountCircle sx={{ color: 'primary.main', mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          Privasi
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pengaturan privasi profil
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        Atur
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <VerifiedUser sx={{ color: 'primary.main', mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          Verifikasi Email
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status verifikasi email
                        </Typography>
                      </Box>
                      <Chip
                        label="Terverifikasi"
                        color="success"
                        size="small"
                        icon={<VerifiedUser />}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Profile;
