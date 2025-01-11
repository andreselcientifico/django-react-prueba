import React, { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { handleLogin } from '../api/conn.api';
import { LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card title="Iniciar Sesión" style={{ width: 300 }}>
        <Form>
          <Form.Item>
            <Input
              placeholder="Nombre del Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Input.Password
              placeholder="Contraseña del Usuario"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" block onClick={() => handleLogin(username, password, navigate)}>
            <LoginOutlined />
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
