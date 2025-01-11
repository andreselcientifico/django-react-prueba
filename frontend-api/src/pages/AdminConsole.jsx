import React, { useEffect, useState } from 'react';
import { Button, Table, Row, Col, Card, Spin } from 'antd'; // Agregado Spin para mostrar carga
import { Bar } from '@ant-design/charts';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '../api/conn.api';

const AdminConsole = () => {
  const [userData, setUserData] = useState([]);  // Para los datos de usuarios
  const [buttonStats, setButtonStats] = useState({ button1: 0, button2: 0 });  // Para las estadísticas de los botones
  const [loading, setLoading] = useState(true);  // Para manejar la carga de datos
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/get_data_users/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
        });
        const data = await response.json();

        if (response.ok) {
          // Usamos un objeto para agrupar las sesiones por usuario y sumar los clics
          const userMap = {};

          data.users.forEach(user => {
            // Si el usuario ya está en el objeto, agregamos la nueva sesión y los clics
            if (!userMap[user.user]) {
              userMap[user.user] = {
                user: user.user,
                loginDate: user.login_time,
                sessionTime: user.session_duration,
                buttonStats: { button1: 0, button2: 0 },
              };
            }

            // Sumamos los clics de los botones
            userMap[user.user].buttonStats.button1 += user.button_stats[1];
            userMap[user.user].buttonStats.button2 += user.button_stats[2];

            // Si la sesión tiene más tiempo, actualizamos la duración de la sesión
            if (user.session_duration && (!userMap[user.user].sessionTime || user.session_duration > userMap[user.user].sessionTime)) {
              userMap[user.user].sessionTime = user.session_duration;
            }
          });

          // Convertimos el objeto en un array para usarlo en la tabla
          const userDataArray = Object.values(userMap).map(user => ({
            key: user.user, // Clave única para la fila de la tabla
            name: user.user,
            loginDate: user.loginDate,
            sessionTime: user.sessionTime,
            button1: user.buttonStats.button1,
            button2: user.buttonStats.button2,
          }));

          setUserData(userDataArray);

          // Calculamos los clics totales para cada botón para el gráfico
          const totalClicks = {
            button1: Object.values(userMap).reduce((acc, user) => acc + user.buttonStats.button1, 0),
            button2: Object.values(userMap).reduce((acc, user) => acc + user.buttonStats.button2, 0),
          };

          setButtonStats(totalClicks);
        } else {
          console.error('Error al cargar los datos');
        }
      } catch (error) {
        console.error('Hubo un error en la solicitud:', error);
      } finally {
        setLoading(false);  // Desactiva el estado de carga cuando los datos se hayan cargado
      }
    };

    fetchData();
  }, []);  // La solicitud solo se realiza una vez cuando se monta el componente

  const columns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Inicio de Sesión', dataIndex: 'loginDate', key: 'loginDate' },
    { title: 'Tiempo', dataIndex: 'sessionTime', key: 'sessionTime' },
    { title: 'Botón 1', dataIndex: 'button1', key: 'button1' },
    { title: 'Botón 2', dataIndex: 'button2', key: 'button2' },
  ];

  const chartData = [
    { button: 'Botón 1', clicks: buttonStats.button1 },
    { button: 'Botón 2', clicks: buttonStats.button2 },
  ];

  const config = {
    data: chartData,
    xField: 'button',
    yField: 'clicks',
    columnWidthRatio: 0.8,
  };

  if (loading) {
    return <Spin size="large" />; // Muestra un spinner mientras se cargan los datos
  };

  return (
    <div style={{ padding: '20px', justifyItems: 'start' }}>
      <Button
        type="default"
        style={{ margin: '10px', width: '10%' }}
        danger
        onClick={() =>handleLogout(navigate)}
      >
        <LogoutOutlined />
      </Button>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Table columns={columns} dataSource={userData} pagination={false} />
        </Col>
        <Col span={8}>
          <Card title="Gráfica de Botones">
            <Bar {...config} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminConsole;
