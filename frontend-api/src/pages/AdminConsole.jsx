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
          const userMap = {};  // Mapeo de usuarios
          const buttonNames = new Set();  // Conjunto para botones dinámicos

          data.users.forEach(user => {
            if (!userMap[user.user]) {
              userMap[user.user] = {
                user: user.user,
                loginDate: user.login_time,
                sessionTime: user.session_duration,
                buttonStats: {},
              };
            }

            // Recorrer dinámicamente todos los botones
            Object.keys(user.button_stats).forEach(button => {
              if (!userMap[user.user].buttonStats[button]) {
                userMap[user.user].buttonStats[button] = 0;
              }
              userMap[user.user].buttonStats[button] += user.button_stats[button];
              buttonNames.add(button);  // Agregar al conjunto de botones
            });

            // Actualizar la sesión más larga
            if (user.session_duration && (!userMap[user.user].sessionTime || user.session_duration > userMap[user.user].sessionTime)) {
              userMap[user.user].sessionTime = user.session_duration;
            }
          });

          // Construcción dinámica de columnas de la tabla
          const columns = [
            { title: 'Nombre', dataIndex: 'name', key: 'name' },
            { title: 'Inicio de Sesión', dataIndex: 'loginDate', key: 'loginDate' },
            { title: 'Tiempo', dataIndex: 'sessionTime', key: 'sessionTime' },
            ...Array.from(buttonNames).map(button => ({
              title: `Botón ${button}`,
              dataIndex: button,
              key: button,
            })),
          ];

          const userDataArray = Object.values(userMap).map(user => {
            const row = {
              key: user.user,
              name: user.user,
              loginDate: user.loginDate,
              sessionTime: user.sessionTime,
            };

            // Agregar los botones detectados dinámicamente
            Array.from(buttonNames).forEach(button => {
              row[button] = user.buttonStats[button] || 0;
            });

            return row;
          });

          setUserData(userDataArray);
          setColumns(columns);

          // Generar estadísticas para los gráficos
          const totalClicks = {};
          Object.values(userMap).forEach(user => {
            Object.keys(user.buttonStats).forEach(button => {
              if (!totalClicks[button]) {
                totalClicks[button] = 0;
              }
              totalClicks[button] += user.buttonStats[button];
            });
          });

          setButtonStats(totalClicks);
        } else {
          console.error('Error al cargar los datos');
        }
      } catch (error) {
        console.error('Hubo un error en la solicitud:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [columns, setColumns] = useState([]);

  const chartData = Object.keys(buttonStats).map(button => ({
    button: `Botón ${button}`,
    clicks: buttonStats[button],
  }));

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
          <Table columns={columns} dataSource={userData} pagination={ false }  scroll={{ x: 'max-content', y: 300 }} bordered />
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
