import { apiClient } from './client';

// Fetch all conversations
export const getConversations = () => 
  apiClient('/api/v1/conversations');

// Fetch messages for specific conversation
export const getMessages = (convId) => 
  apiClient(`/api/v1/conv_messages/${convId}`);

// Send new message
export const sendMessage = (messageData) => 
  apiClient('/api/v1/message', {
    method: 'POST',
    body: JSON.stringify(messageData)
  });
