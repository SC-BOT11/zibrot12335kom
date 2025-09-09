import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  Fade,
  Slide,
  Grow,
} from '@mui/material';
import {
  Event,
  School,
  TrendingUp,
  Security,
  Support,
  AutoAwesome,
  People,
  EmojiEvents,
  Celebration,
  Star,
  CheckCircle,
  Timeline,
} from '@mui/icons-material';

const About: React.FC = () => {
  const features = [
    {
      icon: <Event sx={{ fontSize: 40, color: 'white' }} />,
      title: 'Event Management',
      description: 'Platform lengkap untuk mengelola event dari awal hingga akhir dengan fitur yang user-friendly',
      color: 'linear-gradient(135deg, #667eea, #764ba2)',
    },
    {
      icon: <School sx={{ fontSize: 40, color: 'white' }} />,
      title: 'Sertifikat Digital',
      description: 'Sistem sertifikat otomatis dengan verifikasi kehadiran yang terpercaya dan aman',
      color: 'linear-gradient(135deg, #11998e, #38ef7d)',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'white' }} />,
      title: 'Keamanan Data',
      description: 'Proteksi data pengguna dengan enkripsi tingkat tinggi dan backup otomatis',
      color: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
    },
    {
      icon: <Support sx={{ fontSize: 40, color: 'white' }} />,
      title: 'Dukungan 24/7',
      description: 'Tim support yang siap membantu Anda kapan saja dengan respon cepat',
      color: 'linear-gradient(135deg, #a8edea, #fed6e3)',
    },
  ];

  const stats = [
    { number: '1000+', label: 'Event Berhasil', icon: <Event /> },
    { number: '50K+', label: 'Peserta Aktif', icon: <People /> },
    { number: '95%', label: 'Kepuasan User', icon: <Star /> },
    { number: '24/7', label: 'Dukungan', icon: <Support /> },
  ];

  const timeline = [
    {
      year: '2020',
      title: 'Awal Mula',
      description: 'Platform EventHub didirikan dengan visi untuk memudahkan pengelolaan event',
    },
    {
      year: '2021',
      title: 'Pertumbuhan Pesat',
      description: 'Mencapai 100 event pertama dan 1000 peserta terdaftar',
    },
    {
      year: '2022',
      title: 'Inovasi Fitur',
      description: 'Meluncurkan sistem sertifikat digital dan verifikasi kehadiran otomatis',
    },
    {
      year: '2023',
      title: 'Ekspansi',
      description: 'Menjangkau lebih dari 50 kota di Indonesia dengan ribuan event',
    },
    {
      year: '2024',
      title: 'Masa Depan',
      description: 'Terus berinovasi untuk memberikan pengalaman terbaik bagi pengguna',
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
                  <AutoAwesome sx={{ fontSize: 48, mr: 2, color: '#667eea' }} />
                  <Typography variant="h4" sx={{ fontWeight: 600, opacity: 0.9 }}>
                    Tentang Kami
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
                  Platform Event Management
                  <br />
                  <Box component="span" sx={{
                    background: 'linear-gradient(45deg, #667eea, #FFA500)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                  }}>
                    Terdepan
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
                  EventHub adalah platform event management yang dirancang untuk memudahkan pengelolaan event, 
                  meningkatkan partisipasi, dan memberikan pengalaman terbaik bagi semua pihak yang terlibat.
                </Typography>
              </Box>
            </Fade>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Slide direction="up" in timeout={800}>
          <Box>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom color="primary">
                Pencapaian Kami
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Angka-angka yang membuktikan dedikasi kami dalam memberikan layanan terbaik
              </Typography>
              <Divider sx={{ width: 100, mx: 'auto', borderWidth: 3, borderColor: 'primary.main' }} />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 4,
              }}
            >
              {stats.map((stat, index) => (
                <Box key={index}>
                  <Grow in timeout={1000 + index * 200}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 3,
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
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 2,
                            color: 'primary.main',
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Typography variant="h3" component="div" fontWeight="bold" color="primary" gutterBottom>
                          {stat.number}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {stat.label}
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

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom color="primary">
            Fitur Unggulan
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Teknologi canggih yang memudahkan pengelolaan event Anda
          </Typography>
          <Divider sx={{ width: 100, mx: 'auto', borderWidth: 3, borderColor: 'primary.main' }} />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 4,
          }}
        >
          {features.map((feature, index) => (
            <Box key={index}>
              <Fade in timeout={1000 + index * 200}>
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
                      transform: 'translateY(-8px) scale(1.02)',
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
                        background: feature.color,
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
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="bold" color="primary">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Timeline Section */}
      <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)', py: 10, backdropFilter: 'blur(10px)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom color="primary">
              Perjalanan Kami
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Timeline perjalanan EventHub dari awal hingga sekarang
            </Typography>
            <Divider sx={{ width: 100, mx: 'auto', borderWidth: 3, borderColor: 'primary.main' }} />
          </Box>

          <Box sx={{ position: 'relative' }}>
            {/* Timeline Line */}
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: 4,
                background: 'linear-gradient(180deg, #667eea, #764ba2)',
                transform: 'translateX(-50%)',
                borderRadius: 2,
                display: { xs: 'none', md: 'block' },
              }}
            />

            {timeline.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 4,
                  flexDirection: { xs: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' },
                }}
              >
                <Slide direction={index % 2 === 0 ? 'left' : 'right'} in timeout={800 + index * 200}>
                  <Paper
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      width: { xs: '100%', md: '45%' },
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={item.year}
                        color="primary"
                        sx={{ fontWeight: 'bold', mr: 2 }}
                      />
                      <Timeline sx={{ color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="bold" color="primary">
                      {item.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {item.description}
                    </Typography>
                  </Paper>
                </Slide>

                {/* Timeline Dot */}
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    border: '4px solid white',
                    boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.2)',
                    mx: { xs: 0, md: 4 },
                    my: { xs: 2, md: 0 },
                    display: { xs: 'none', md: 'block' },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Mission & Vision Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom color="primary">
            Misi & Visi
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Komitmen kami untuk memberikan layanan terbaik
          </Typography>
          <Divider sx={{ width: 100, mx: 'auto', borderWidth: 3, borderColor: 'primary.main' }} />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 6,
          }}
        >
          <Box>
            <Fade in timeout={1000}>
              <Card
                sx={{
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <EmojiEvents sx={{ fontSize: 48, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" component="h3" fontWeight="bold" color="primary">
                      Misi
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                    Menyediakan platform event management yang inovatif dan user-friendly untuk memudahkan 
                    pengelolaan event, meningkatkan partisipasi, dan memberikan pengalaman terbaik bagi 
                    semua pihak yang terlibat dalam ekosistem event.
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Box>

          <Box>
            <Fade in timeout={1200}>
              <Card
                sx={{
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUp sx={{ fontSize: 48, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" component="h3" fontWeight="bold" color="primary">
                      Visi
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                    Menjadi platform event management terdepan di Indonesia yang dikenal karena inovasi, 
                    keandalan, dan komitmen untuk memberikan solusi terbaik dalam pengelolaan event 
                    digital yang modern dan efisien.
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Box>
        </Box>
      </Container>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </Box>
  );
};

export default About;
