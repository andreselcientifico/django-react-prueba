import React, { useState, useEffect } from 'react';
import { Button, Card,  Input, Upload  } from 'antd';
import { LogoutOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const UserLandingPage = () => {
  const [config, setConfig] = useState({ title: "", description: "", logo: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const response = await fetch('http://localhost:8000/api/v1/verify-token/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('access_token')}`,
          },
        });

        if (response.ok) {
            await fetch('http://localhost:8000/api/v1/get-data/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({
              user_id: userId, 
            }),
          })
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

  // Registrar clic de botón en el backend
  const handleButtonClick = async (buttonName) => {
    const response = await fetch('http://localhost:8000/api/v1/register-button-click/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('access_token')}`,  // Asegúrate de enviar el token si estás usando JWT
      },
      body: JSON.stringify({ button_name: buttonName }),
    });

    if (buttonName === 'button1') {
      await fetch('http://localhost:8000/api/v1/get-data/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('access_token')}`,  // Asegúrate de enviar el token si estás usando JWT
        },
        body: JSON.stringify({
          user_id: localStorage.getItem('user_id'),
        }),
      })
        .then(response => response.json())
        .then(data => {
          setConfig(data);
        })
        .catch(error => {
          console.error('Error fetching config:', error);
        });
        
  
    } else if (buttonName === 'button2') {
      try {
        const response = await fetch('http://localhost:8000/api/v1/post-data/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({
            user_id: localStorage.getItem('user_id'),
            title: config.title,
            description: config.description,
            logo: config.logo,
          }),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('Datos guardados correctamente:', data);
          alert('Datos guardados correctamente');
        } else {
          console.error('Error al guardar los datos:', response.status);
          alert('Hubo un error al guardar los datos');
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
        alert('Error en la solicitud');
      }
    }

    if (response.ok) {
      console.log(`Button ${buttonName} clicked and registered.`);
    } else {
      console.error('Error registering button click');
    }
  };

  const handleInputChange = (e, field) => {
    setConfig({
      ...config,
      [field]: e.target.value,
    });
  };

  const handleLogoChange = (e) => {
    const file = e.file.originFileObj;
    const reader = new FileReader();

    reader.onloadend = () => {
      setConfig({
        ...config,
        logo: reader.result,
      });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    await fetch('http://localhost:8000/api/v1/logout/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({
        username: localStorage.getItem('username'),
      }),
    });
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('username');
    navigate('/');
  };

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
            onClick={handleLogout}
          >
          <LogoutOutlined />
        </Button>
      </Card>
    </div>
  );
};

export default UserLandingPage;
