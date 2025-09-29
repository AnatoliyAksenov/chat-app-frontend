import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Chat from './pages/Chat';
import { ChatProvider } from './context/ChatContext';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Layout wrapper component
const AppLayout = ({ children, isLoginPage = false }) => {
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {children}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <AppLayout isLoginPage={true}>
              <Login />
            </AppLayout>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <ChatProvider>
                  <Chat />
                </ChatProvider>
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;