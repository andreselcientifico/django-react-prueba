import React from 'react';
import { Table, Row, Col, Card } from 'antd';
import { Bar } from '@ant-design/charts';

const AdminConsole = ({ userData, buttonStats }) => {
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

  return (
    <div style={{ padding: '20px' }}>
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
