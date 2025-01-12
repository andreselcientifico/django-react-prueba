import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

export const handleLogin = async (username, password, navigate) => {
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

export const handleLogout = async (navigate) => {
    await fetch('http://localhost:8000/api/v1/logout/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({
        user_id: localStorage.getItem('user_id'),
      }),
    });
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('username');
    navigate('/');
  };

  // Registrar clic de botón en el backend
export const handleButtonClick = async (buttonName, config, setConfig) => {
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
          'Authorization': `Token ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          user_id : localStorage.getItem('user_id'), 
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

export const handleInputChange = (e, field, setConfig, config) => {
    setConfig({
      ...config,
      [field]: e.target.value,
    });
  };

export const handleLogoChange = (e, setConfig, config) => {
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


export const verify_token = async () => {
    return await fetch('http://localhost:8000/api/v1/verify-token/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('access_token')}`,
      },
    });
  };
  

export const get_data = async (setConfig) => {
    await fetch('http://localhost:8000/api/v1/get-data/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({
        user_id : localStorage.getItem('user_id'), 
      }),
    })
    .then(response => response.json())
    .then(data => {
      setConfig(data);
    })
    .catch(error => {
      console.error('Error fetching config:', error);
    });
};

  