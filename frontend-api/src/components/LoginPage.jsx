import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  // Usamos el hook useHistory para la redirección

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/token/', {
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
        const { access_token, refresh_token, is_admin } = await response.json();
        console.log('Access Token:', access_token, '\nis_admin', is_admin);
        // Guarda los tokens en el localStorage
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
  
        // Llama a la función onLogin para pasar el token
        onLogin(access_token);
  
        // Redirige dependiendo si es admin o no
        if (is_admin) {
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
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
