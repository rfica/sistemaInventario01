import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';
import { Layout, Menu, Button } from 'antd';
import {
  AppstoreOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  TagsOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Sider, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <AppstoreOutlined />, label: 'Panel Principal' },
  { key: '/productos', icon: <ShoppingOutlined />, label: 'Productos' },
  { key: '/movimientos', icon: <BarChartOutlined />, label: 'Movimientos' },
  { key: '/categorias', icon: <TagsOutlined />, label: 'Categorías' },
  { key: '/reportes', icon: <BarChartOutlined />, label: 'Reportes' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else {
      navigate(key);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 20, padding: 16, textAlign: 'center' }}>
          Inventario
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
        />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button icon={<LogoutOutlined />} onClick={() => handleMenuClick({ key: 'logout' })}>
            Cerrar sesión
          </Button>
        </div>
      </Sider>
      <Layout>
        <Content style={{ margin: '24px 16px 0', background: '#fff', borderRadius: 8, minHeight: 280, padding: 24 }}>
          <h1>Panel Principal</h1>
          <p>Bienvenido, {user?.username} ({user?.role || 'Usuario'})</p>
          <p>Selecciona una opción del menú para comenzar.</p>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
