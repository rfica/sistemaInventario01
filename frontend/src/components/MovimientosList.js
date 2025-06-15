import React, { useState, useEffect } from 'react';
import { Table, Tag, Input, Space, Button, Popconfirm, message, Form } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import stockService from '../services/stockService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const MovimientosList = ({ onRefresh }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(moment());
  const [pageSize, setPageSize] = useState(10); // Estado para el tamaño de página
  const [filterFrom, setFilterFrom] = useState(() => new Date());
  const [filterTo, setFilterTo] = useState(() => new Date());

  useEffect(() => {
    fetchMovements();
  }, []);

  useEffect(() => {
    if (onRefresh) fetchMovements();
    // eslint-disable-next-line
  }, [onRefresh]);

  useEffect(() => {
    // Normaliza fechas si no son moment válidos
    if (!moment.isMoment(filterFrom)) setFilterFrom(new Date());
    if (!moment.isMoment(filterTo)) setFilterTo(new Date());
  }, []);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const data = await stockService.getMovements();
      console.log('Movimientos recibidos del backend:', data);
      // Normalizar los datos para la tabla
      const normalized = data.map(mov => ({
        movementId: mov.MovementId,
        accountingDate: mov.AccountingDate,
        productName: mov.ProductName || mov.ProductId,
        productCode: mov.ProductCode,
        type: mov.Type,
        quantity: mov.Quantity,
        unit: mov.Unit,
        amount: mov.Amount,
        documentNumber: mov.DocumentNumber,
        lineNumber: mov.LineNumber,
        description: mov.Description,
        username: mov.Username
      }));
      console.log('Movimientos normalizados:', normalized);
      setMovements(normalized);
    } catch (error) {
      message.error('Error al cargar los movimientos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar movimientos por rango de fechas seleccionadas
  const filteredMovements = movements.filter(mov => {
    // Convertir a Date para comparar
    const fecha = mov.accountingDate ? new Date(mov.accountingDate) : null;
    const desde = filterFrom;
    const hasta = filterTo;
    if (!fecha) return false;
    // Comparar solo la parte de la fecha (YYYY-MM-DD)
    const fechaStr = fecha.toISOString().slice(0, 10);
    const desdeStr = desde.toISOString().slice(0, 10);
    const hastaStr = hasta.toISOString().slice(0, 10);
    const inRange = fechaStr >= desdeStr && fechaStr <= hastaStr;
    if (inRange) {
      console.log('Movimiento en rango:', mov);
    }
    return inRange;
  });

  const handleDelete = async (movementId) => {
    try {
      await stockService.deleteMovement(movementId);
      message.success('Movimiento eliminado correctamente');
      fetchMovements();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error('Error al eliminar el movimiento');
    }
  };

  // Refuerzo extremo: función para asegurar moment válido
  function getValidMoment(val) {
    return moment.isMoment(val) && val.isValid() ? val : moment();
  }

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'accountingDate',
      key: 'accountingDate',
      render: (date) => moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY')
    },
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Código Producto',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        let label = '';
        switch (type) {
          case '01': label = 'Ingreso'; break;
          case '02': label = 'Anulación Ingreso'; break;
          case '03': label = 'Egreso'; break;
          case '04': label = 'Anulación Egreso'; break;
          default: label = type;
        }
        return <Tag color={['01','02'].includes(type) ? 'green' : 'red'}>{label}</Tag>;
      }
    },
    {
      title: 'Código Tipo',
      dataIndex: 'type',
      key: 'typeCode',
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Unidad',
      dataIndex: 'unit',
      key: 'unit'
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => amount != null ? amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) : ''
    },
    {
      title: 'Documento',
      dataIndex: 'documentNumber',
      key: 'documentNumber'
    },
    {
      title: 'Línea',
      dataIndex: 'lineNumber',
      key: 'lineNumber'
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Usuario',
      dataIndex: 'username',
      key: 'username'
    }
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
 <Form layout="inline">
 <Form.Item label="Desde:" style={{ marginBottom: 0 }}>
 <DatePicker
 selected={filterFrom}
 onChange={date => setFilterFrom(date || new Date())}
 dateFormat="dd/MM/yyyy"
 className="ant-input"
 showMonthDropdown
 showYearDropdown
 />
 </Form.Item>
 <Form.Item label="Hasta:" style={{ marginBottom: 0 }}>
 <DatePicker
 selected={filterTo}
 onChange={date => setFilterTo(date || new Date())}
 dateFormat="dd/MM/yyyy"
          className="ant-input"
 showMonthDropdown
 showYearDropdown
        />
 </Form.Item>
 </Form>
        <span>Mostrando movimientos entre las fechas seleccionadas</span>
        <Button onClick={fetchMovements}>Actualizar</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredMovements}
        rowKey="movementId"
        loading={loading}
 pagination={{ // Configuración de paginación
 pageSize: pageSize, // Usar el estado para el tamaño de página
 onShowSizeChange: (current, size) => setPageSize(size), // Manejar cambio de tamaño
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} movimientos`
        }}
      />
    </div>
  );
};

export default MovimientosList; 