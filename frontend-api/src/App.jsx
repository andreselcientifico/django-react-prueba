import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // Estado para verificar si el usuario está logueado

  useEffect(() => {
    const checkSession = () => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        setIsLoggedIn(true); // Si hay token, está logueado
      } else {
        setIsLoggedIn(false); // Si no hay token, no está logueado
      }
    };

    checkSession();
  }, []);

  if (isLoggedIn === null) {
    return <div>Loading...</div>; // O alguna animación de carga mientras se verifica la sesión
  }

  return (
    <>
      {/* Si está logueado, redirige a la página correspondiente */}
      {isLoggedIn ? <Navigate to="/admin" /> : <Navigate to="/" />}
    </>
  );
};

export default App;
