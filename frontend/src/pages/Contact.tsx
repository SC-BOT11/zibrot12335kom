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
  Divider,
  Chip,
  Fade,
  Slide,
  Grow,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Schedule,
  Send,
  Support,
  AutoAwesome,
  ContactSupport,
  Business,
  AccessTime,
} from '@mui/icons-material';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form submitted:', formData);
    setSnackbar({
      open: true,
      message: 'Pesan Anda telah berhasil dikirim! Kami akan segera menghubungi Anda.',
      severity: 'success',
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const contactInfo = [
    {
      icon: <Email sx={{ fontSize: 40, color: 'white' }} />,
      title: 'Email',
      value: 'info@eventhub.com',
      description: 'Kirim email kepada kami',
      color: 'linear-gradient(135deg, #667eea, #764ba2)',
    },
    {
      icon: <Phone sx={{ fontSize: 40, color: 'white' }} />,
      title: 'Telepon',
      value: '+62 21 1234 5678',
      description: 'Hubungi kami langsung',
      color: 'linear-gradient(135deg, #11998e, #38ef7d)',
    },
    {
      icon: <LocationOn sx={{ fontSize: 40, color: 'white' }} />,
      title: 'Alamat',
      value: 'Jakarta, Indonesia',
      description: 'Kantor pusat kami',
      color: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
    },
    {
      icon: <Schedule sx={{ fontSize: 40, color: 'white' }} />,
      title: 'Jam Kerja',
      value: 'Senin - Jumat',
      description: '09:00 - 18:00 WIB',
      color: 'linear-gradient(135deg, #a8edea, #fed6e3)',
    },
  ];

  const faqItems = [
    {
      question: 'Bagaimana cara mendaftar event?',
      answer: 'Anda dapat mendaftar event dengan membuat akun terlebih dahulu, kemudian pilih event yang diinginkan dan klik tombol "Daftar".',
    },
    {
      question: 'Apakah ada biaya untuk menggunakan platform?',
      answer: 'Platform EventHub gratis untuk digunakan. Beberapa event mungkin memerlukan biaya pendaftaran sesuai dengan penyelenggara event.',
    },
    {
      question: 'Bagaimana cara mendapatkan sertifikat?',
      answer: 'Sertifikat akan otomatis dikirim ke email Anda setelah mengikuti event dan mengisi daftar hadir dengan token yang diberikan.',
    },
    {
      question: 'Apakah data saya aman?',
      answer: 'Ya, kami menggunakan enkripsi tingkat tinggi untuk melindungi data pribadi Anda dan tidak akan membagikan informasi kepada pihak ketiga.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: 'float 20s ease-in-out infinite',
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Fade in timeout={1000}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                  <ContactSupport sx={{ fontSize: 48, mr: 2, color: '#667eea' }} />
                  <Typography variant="h4" sx={{ fontWeight: 600, opacity: 0.9 }}>
                    Hubungi Kami
                  </Typography>
                </Box>
                <Typography
                  variant="h2"
                  component="h1"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    mb: 3,
                  }}
                >
                  Mari Berbincang
                  <br />
                  <Box component="span" sx={{
                    background: 'linear-gradient(45deg, #667eea, #FFA500)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                  }}>
                    Bersama
                  </Box>
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    maxWidth: 800,
                    mx: 'auto',
                    opacity: 0.9,
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    lineHeight: 1.6,
                  }}
                >
                  Tim kami siap membantu Anda dengan pertanyaan, saran, atau dukungan teknis. 
                  Jangan ragu untuk menghubungi kami kapan saja.
                </Typography>
              </Box>
            </Fade>
          </Box>
        </Container>
      </Box>

      {/* Contact Info Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Slide direction="up" in timeout={800}>
          <Box>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom color="primary">
                Informasi Kontak
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Berbagai cara untuk menghubungi tim kami
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 4,
              }}
            >
              {contactInfo.map((info, index) => (
                <Box key={index}>
                  <Grow in timeout={1000 + index * 200}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 4,
                        height: '100%',
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
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: info.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            '&:hover': {
                              transform: 'scale(1.1) rotate(5deg)',
                              transition: 'all 0.3s ease',
                            },
                          }}
                        >
                          {info.icon}
                        </Box>
                        <Typography variant="h6" component="h3" gutterBottom fontWeight="bold" color="primary">
                          {info.title}
                        </Typography>
                        <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600, mb: 1 }}>
                          {info.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {info.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                </Box>
              ))}
            </Box>
          </Box>
        </Slide>
      </Container>

      {/* Contact Form Section */}
      <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)', py: 10, backdropFilter: 'blur(10px)' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 8,
              alignItems: 'center',
            }}
          >
            <Box>
              <Fade in timeout={1000}>
                <Box>
                  <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom color="primary">
                    Kirim Pesan
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                    Isi formulir di bawah ini dan kami akan segera menghubungi Anda. 
                    Tim support kami siap membantu 24/7.
                  </Typography>

                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Support sx={{ color: 'primary.main', mr: 2 }} />
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        Dukungan 24/7
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      Tim kami siap membantu Anda kapan saja dengan respon cepat dan solusi terbaik.
                    </Typography>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Business sx={{ color: 'primary.main', mr: 2 }} />
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        Profesional
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      Didukung oleh tim yang berpengalaman dan berdedikasi untuk memberikan layanan terbaik.
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            </Box>

            <Box>
              <Slide direction="left" in timeout={1200}>
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <form onSubmit={handleSubmit}>
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
                          required
                          variant="outlined"
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
                          required
                          variant="outlined"
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
                          label="Subjek"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
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
                          label="Pesan"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          multiline
                          rows={4}
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          size="large"
                          startIcon={<Send />}
                          sx={{
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Kirim Pesan
                        </Button>
                      </Box>
                    </Box>
                  </form>
                </Paper>
              </Slide>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom color="primary">
            Pertanyaan Umum
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Jawaban untuk pertanyaan yang sering diajukan
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 4,
          }}
        >
          {faqItems.map((faq, index) => (
            <Box key={index}>
              <Fade in timeout={1000 + index * 200}>
                <Card
                  sx={{
                    p: 3,
                    height: '100%',
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AutoAwesome sx={{ color: 'primary.main', mr: 2 }} />
                      <Typography variant="h6" component="h3" fontWeight="bold" color="primary">
                        {faq.question}
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {faq.answer}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Snackbar for form submission */}
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

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </Box>
  );
};

export default Contact;
