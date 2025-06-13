import React from 'react';
import { Row, Col, Typography } from 'antd';
import MovimientoForm from '../components/MovimientoForm';
import MovimientosList from '../components/MovimientosList';

const { Title } = Typography;

const Movimientos = () => {
  const handleSuccess = () => {
    // La lista se actualizará automáticamente cuando se registre un nuevo movimiento
  };

  return (
    <div className="movimientos-page">
      <Title level={2}>Movimientos de Stock</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <MovimientoForm onSuccess={handleSuccess} />
        </Col>
        
        <Col xs={24} lg={16}>
          <MovimientosList onRefresh={handleSuccess} />
        </Col>
      </Row>
    </div>
  );
};

export default Movimientos;