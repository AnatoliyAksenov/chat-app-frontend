import { apiClient } from './client';

export const login = (credentials) => 
  apiClient('/api/v1/auth', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
