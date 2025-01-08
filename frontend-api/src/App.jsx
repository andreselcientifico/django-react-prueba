import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import AdminConsole from './components/AdminConsole';
import UserLandingPage from './components/UserLandingPage';

const App = () => {
  const [userType, setUserType] = useState(null);

  const handleLogin = (username, password) => {
    // Lógica para verificar usuario (llamada al backend)
    if (username === 'admin') {
      setUserType('admin');
    } else {
      setUserType('user');
    }
  };

  const handleButtonClick = (button) => {
    console.log(`${button} presionado`);
  };

  if (!userType) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return userType === 'admin' ? (
    <AdminConsole
      userData={[
        { key: '1', name: 'Usuario 1', loginDate: '2025-01-01', sessionTime: '15 min', button1: 5, button2: 10 },
        // Más datos...
      ]}
      buttonStats={{ button1: 50, button2: 70 }}
    />
  ) : (
    <UserLandingPage onButtonClick={handleButtonClick} />
  );
};

export default App;
