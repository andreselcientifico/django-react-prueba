import React, { useEffect, useState } from 'react';
import { Button, Table, Row, Col, Card, Spin } from 'antd';
import { Bar, Pie, Line } from '@ant-design/charts';
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

  const barConfig = { data: chartData, xField: 'button', yField: 'clicks', columnWidthRatio: 0.8 };
  const pieConfig = { data: chartData, angleField: 'clicks', colorField: 'button' };
  const lineConfig = { data: chartData, xField: 'button', yField: 'clicks' };
  const pieData = chartData.map(item => ({
    type: item.button,
    value: item.clicks,
  }));

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;

  return (
    <div style={{ padding: 20, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Button type="primary" danger icon={<LogoutOutlined />} onClick={() => handleLogout(navigate)} style={{ marginBottom: 20 }}>
        Salir
      </Button>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Table columns={columns} dataSource={userData} pagination={false} bordered />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card title="Gráfica de Barras">
            <Bar data={chartData} xField="button" yField="clicks" columnWidthRatio={0.8} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card title="Gráfica Circular">
            <Pie data={pieData} angleField="value" colorField="type" radius={0.9} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card title="Gráfica de Línea">
            <Line data={chartData} xField="button" yField="clicks" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminConsole;
