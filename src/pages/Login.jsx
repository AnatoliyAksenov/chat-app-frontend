import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Form, Input, Card } from 'antd';
import './Login.css';

export default function Login() {
  const { user, login: authLogin, isLoading } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    try {
      setError('');
      await authLogin(values);
    } catch {
      setError('Invalid credentials');
    }
  };

  useEffect(() => {
    if (!!user) {
      window.location.href = '/'
    }
  }, [user])

  return (
    <div className="login-override">
      <Card title="Login">
        <Form onFinish={handleSubmit}>
          <Form.Item name="username" rules={[{ required: true }]}>
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>
          {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isLoading}
            block
          >
            Sign In
          </Button>
        </Form>
      </Card>
    </div>
  );
}