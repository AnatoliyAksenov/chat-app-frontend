import { createContext, useState, useContext, useEffect } from 'react';
import { login } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage to prevent null flashes
  const [user, setUser] = useState(() => {
    const storedId = localStorage.getItem('chatApp_userId');
    return storedId ? { id: storedId } : null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // NEW: Proper init state

  // Persist user ID to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('chatApp_userId', user.id);
    } else {
      localStorage.removeItem('chatApp_userId');
    }
  }, [user]);

  // ONLY set initialized AFTER initial check
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    try {
      const userData = await login(credentials);
      
      setUser(prev => {
        // Return new user state
        return { 
          ...userData,
          id: userData.id || 'fallback-id' 
        };
      });

      localStorage.setItem('chatApp_userId', userData.id);
      
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // localStorage cleared via useEffect above
  };

  // ✅ ESSENTIAL: Only render children when initialized
  if (!isInitialized) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, // Clear auth status
      isLoading, 
      login: handleLogin, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // ✅ SAFETY CHECK: Prevent usage outside provider
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};
