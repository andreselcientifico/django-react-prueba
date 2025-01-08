import React from 'react';
import { Button, Card } from 'antd';

const UserLandingPage = ({ onButtonClick }) => {
    const [config, setConfig] = useState({ title: "", description: "", logo: "" });

    useEffect(() => {
        fetch("/api/landing-config/")
            .then((response) => response.json())
            .then((data) => setConfig(data))
            .catch((error) => console.error("Error fetching landing config:", error));
    }, []);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px' }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <img src="logo.png" alt="Logo" style={{ width: '100px', marginBottom: '20px' }} />
        <h1>{config.title}</h1>
        <p>{config.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
          <Button type="primary" onClick={() => onButtonClick('button1')}>
            Botón 1
          </Button>
          <Button type="primary" onClick={() => onButtonClick('button2')}>
            Botón 2
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UserLandingPage;
