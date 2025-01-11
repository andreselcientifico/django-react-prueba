import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

import Login from './components/LoginPage.jsx'
import Admin from './pages/AdminConsole.jsx'
import User from './pages/UserLandingPage.jsx'

const router = createHashRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/admin',
    element: < Admin />,
  },
  {
    path: '/user',
    element: < User />,
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>
);