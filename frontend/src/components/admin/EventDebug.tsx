import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Alert,
} from '@mui/material';
import { eventService } from '../../services/api';
import api from '../../services/api';

interface DebugInfo {
  auth?: string;
  user?: any;
  token?: string | null;
  createEvent?: string;
  eventData?: any;
  errorDetails?: any;
}

const EventDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testAuth = async () => {
    try {
      const response = await api.get('/user');
      setDebugInfo({
        auth: 'Success',
        user: response.data,
        token: localStorage.getItem('auth_token')
      });
      setError(null);
    } catch (err: any) {
      setError(`Auth Error: ${err.response?.data?.message || err.message}`);
      setDebugInfo({
        auth: 'Failed',
        token: localStorage.getItem('auth_token')
      });
    }
  };

  const testCreateEvent = async () => {
    try {
      const formData = new FormData();
      formData.append('title', 'Test Event Debug');
      formData.append('description', 'Test Description Debug');
      // Gunakan tanggal yang valid (minimal H-3 dari tanggal pelaksanaan)
      const today = new Date();
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + 5); // Event di H+5
      
      const regDeadline = new Date(today);
      regDeadline.setDate(today.getDate() + 2); // Registration deadline H+2
      
      formData.append('date', eventDate.toISOString().split('T')[0]);
      formData.append('start_time', '09:00');
      formData.append('end_time', '17:00');
      formData.append('location', 'Test Location Debug');
      formData.append('max_participants', '50');
      formData.append('registration_deadline', regDeadline.toISOString().split('T')[0]);

      const response = await eventService.createEvent(formData);
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev,
        createEvent: 'Success',
        eventData: response.data
      }));
      setError(null);
    } catch (err: any) {
      setError(`Create Event Error: ${err.response?.data?.message || err.message}`);
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev,
        createEvent: 'Failed',
        errorDetails: err.response?.data
      }));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Event Debug Tool
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={testAuth}>
          Test Authentication
        </Button>
        <Button variant="contained" onClick={testCreateEvent}>
          Test Create Event
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {debugInfo && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Debug Information:
          </Typography>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
};

export default EventDebug;
