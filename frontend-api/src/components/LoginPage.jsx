import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LoginOutlined } from '@ant-design/icons';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('is_admin', data.is_admin);
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('username', data.user);
        // Redirige dependiendo si es admin o no
        console.log(data.user_id);
        if (data.is_admin) {
          navigate('/admin');  // Página de admin
        } else {
          navigate('/user');  // Página de usuario normal
        }
  
        message.success('Inicio de sesión exitoso');
      } else {
        message.error('Credenciales incorrectas');
      }
    } catch (error) {
      message.error('Hubo un error al procesar la solicitud');
    }
  };

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
            <Button type="primary" block onClick={handleLogin}>
            <LoginOutlined />
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
