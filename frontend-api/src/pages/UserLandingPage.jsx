import React, { useState, useEffect } from 'react';
import { Button, Card,  Input, Upload  } from 'antd';
import { LogoutOutlined, UploadOutlined } from '@ant-design/icons';
import { handleLogout, handleButtonClick, handleInputChange, verify_token, get_data, handleLogoChange } from '../api/conn.api';
import { useNavigate } from 'react-router-dom';

const UserLandingPage = () => {
  const [config, setConfig] = useState({ title: "", description: "", logo: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = verify_token(token);

        if (response.ok) {
          const data = get_data(token)
          .then(response => response.json())
          .then(data => {
            setConfig(data);
          })
          .catch(error => {
            console.error('Error fetching config:', error);
          });
        } else if (response.status === 401) {
          // Si el token no es válido, redirigir al login
          history.push('/login');
        }
      } catch (error) {
        console.error('Error fetching config:', error);
        // Redirigir al login si ocurre un error
        history.push('/login');
      }
    };

    fetchData();
  }, [history]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px' }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        {config.logo ? (
          <img src={config.logo} alt="Logo" style={{ width: '100px', marginBottom: '20px' }} />
        ) : (
          <Upload
            onChange={handleLogoChange}
            showUploadList={false}
            customRequest={({ onSuccess }) => onSuccess()}
          >
            <Button icon={<UploadOutlined />}>Subir logo</Button>
          </Upload>
        )}
        <Input
          style={{ marginBottom: '10px' }}
          value={config.title}
          onChange={(e) => handleInputChange(e, 'title')}
          placeholder="Título"
        />
        <Input
          style={{ marginBottom: '10px' }}
          value={config.description}
          onChange={(e) => handleInputChange(e, 'description')}
          placeholder="Descripción"
        />
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
          <Button type="primary" onClick={() => handleButtonClick('button1')}>
            Cargar
          </Button>
          <Button type="primary" onClick={() => handleButtonClick('button2')}>
            Guardar
          </Button>
        </div>
        <Button
            type="default"
            style={{ marginTop: '20px', width: '100%' }}
            danger
            onClick={() => handleLogout(navigate)}
          >
          <LogoutOutlined />
        </Button>
      </Card>
    </div>
  );
};

export default UserLandingPage;
