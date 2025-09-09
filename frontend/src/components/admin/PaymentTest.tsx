import React, { useState } from 'react';
import { Box, Typography, Button, Alert, Paper } from '@mui/material';

const PaymentTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testPaymentAPI = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('auth_token');
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      console.log('Testing Payment API...');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Base URL:', baseURL);

      const response = await fetch(`${baseURL}/admin/payment-stats?range=30`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      setResult(data);
    } catch (err) {
      console.error('Payment API test error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      console.log('Testing Login API...');
      console.log('Base URL:', baseURL);

      const response = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'password123'
        }),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login error response:', errorText);
        throw new Error(`Login failed! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Login response data:', data);
      
      if (data.status === 'success' && data.data.token) {
        localStorage.setItem('auth_token', data.data.token);
        setResult({ message: 'Login successful! Token saved.', token: data.data.token.substring(0, 20) + '...' });
      } else {
        throw new Error('Login response format error');
      }
    } catch (err) {
      console.error('Login test error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Login Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Payment API Test
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={testLogin}
          disabled={loading}
          sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}
        >
          Test Login
        </Button>
        <Button 
          variant="contained" 
          onClick={testPaymentAPI}
          disabled={loading}
          sx={{ background: 'linear-gradient(45deg, #f093fb, #f5576c)' }}
        >
          Test Payment API
        </Button>
      </Box>

      {loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Testing API... Please wait.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Test Result:
          </Typography>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Paper>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Debug Info:
        </Typography>
        <Typography variant="body2">
          Auth Token: {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}
        </Typography>
        <Typography variant="body2">
          Base URL: {process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}
        </Typography>
      </Box>
    </Box>
  );
};

export default PaymentTest;
