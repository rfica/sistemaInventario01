import React from 'react';
import { Table, Tag } from 'antd';
import moment from 'moment';

const getTipoMovimiento = (tipo) => {
  switch(tipo) {
    case '01':
      return { label: 'Ingreso', color: 'green' };
    case '02':
      return { label: 'Anulación Ingreso', color: 'orange' };
    case '03':
      return { label: 'Egreso', color: 'red' };
    case '04':
      return { label: 'Anulación Egreso', color: 'blue' };
    default:
      return { label: tipo, color: 'gray' };
  }
};

const HistorialMovimientos = ({ data }) => {
  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'accountingDate',
      key: 'accountingDate',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => new Date(a.accountingDate) - new Date(b.accountingDate),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
      render: (_, record) => record.productId === 101 ? 'Laptop HP' : `Producto ${record.productId}`
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (tipo) => {
        const movimiento = getTipoMovimiento(tipo);
        return <Tag color={movimiento.color}>{movimiento.label}</Tag>;
      }
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right'
    },
    {
      title: 'Doc N°',
      dataIndex: 'documentNumber',
      key: 'documentNumber'
    },
    {
      title: 'Usuario',
      dataIndex: 'createdBy',
      key: 'createdBy'
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="movementId"
      pagination={{ pageSize: 5 }}
      size="middle"
      scroll={{ x: true }}
    />
  );
};

export default HistorialMovimientos;