// frontend/src/pages/Productos.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import productService from '../services/productService';

const Productos = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  // Columnas de la tabla
  const columns = [
    {
      title: 'ID',
      dataIndex: 'productId',
      key: 'productId',
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Categoría',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId) => `Categoría ${categoryId}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price.toLocaleString()}`,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <div>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          />
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.productId)}
            danger
          />
        </div>
      ),
    },
  ];

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      message.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await productService.delete(id);
      message.success('Producto eliminado correctamente');
      fetchProducts();
    } catch (error) {
      message.error('Error al eliminar el producto');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingProduct) {
        await productService.update(editingProduct.productId, values);
        message.success('Producto actualizado correctamente');
      } else {
        await productService.create(values);
        message.success('Producto creado correctamente');
      }
      
      setIsModalVisible(false);
      fetchProducts();
    } catch (error) {
      console.error('Error al guardar el producto:', error);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Gestión de Productos</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
        >
          Agregar Producto
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={products} 
        rowKey="productId"
        loading={loading}
      />

      <Modal
        title={editingProduct ? 'Editar Producto' : 'Agregar Producto'}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={editingProduct ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Categoría"
            rules={[{ required: true, message: 'Por favor ingrese la categoría' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="stock"
            label="Stock inicial"
            rules={[{ required: true, message: 'Por favor ingrese el stock' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Precio"
            rules={[{ required: true, message: 'Por favor ingrese el precio' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Productos;