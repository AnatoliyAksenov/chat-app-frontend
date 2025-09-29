export const apiClient = async (endpoint, options = {}, onMessage = null) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle unauthorized
  if (response.status === 401) {
    console.log('Authentication failed. Redirecting to login');
    localStorage.removeItem('chatApp_userId');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  // Check if this is a streaming response
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/event-stream')) {
    return handleStream(response);
  }

  // Fallback to JSON for non-streaming responses
  return response.json();
};

// Helper to handle streaming response
async function handleStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
  }

  try {
    const data = JSON.parse(buffer);
    return data
  } catch (err) {
    console.warn('Failed to parse JSON:', trimmedLine);
  }

  try {
    const data = JSON.parse(buffer.trim());
    if (onMessage) onMessage(data);
  } catch (err) {
    console.warn('Failed to parse final JSON:', buffer);
  }
  
}