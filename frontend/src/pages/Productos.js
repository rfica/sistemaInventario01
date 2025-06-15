// frontend/src/pages/Productos.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Select, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import productService from '../services/productService';
import categoryService from '../services/categoryService';

const { Option } = Select;

const Productos = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchCategory, setSearchCategory] = useState(null);
  const [form] = Form.useForm();

  // Columnas de la tabla
  const columns = [
    {
      title: 'ID',
      dataIndex: 'productId',
      key: 'productId',
      sorter: (a, b) => a.productId - b.productId,
      responsive: ['md'],
    },
    {
      title: 'Código',
      dataIndex: 'productCode',
      key: 'productCode',
      sorter: (a, b) => (a.productCode || '').localeCompare(b.productCode || ''),
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      responsive: ['md'],
    },
    {
      title: 'Categoría',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId) => {
        const cat = categories.find(c => c.categoryId === categoryId);
        return cat ? cat.name : 'Sin categoría';
      },
    },
    {
      title: 'Stock Mínimo',
      dataIndex: 'minimumStock',
      key: 'minimumStock',
      responsive: ['lg'],
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.productId)}
            danger
          />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      message.error('Error al cargar las categorías');
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.Name = searchText;
      if (searchCategory) params.CategoryId = searchCategory;
      const results = await productService.search(params);
      setProducts(results);
    } catch (error) {
      message.error('Error al buscar productos');
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
    form.setFieldsValue({
      productCode: product.productCode,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      minimumStock: product.minimumStock
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
 console.log('handleDelete called with ID:', id);
 // Find the product in the current state to check its stock
    const productToDelete = products.find(p => p.productId === id);

    if (productToDelete && productToDelete.currentStock > 0) {
      // If product has stock, show error message directly
      message.error('No se puede eliminar el producto porque tiene movimientos de inventario asociados.');
      return; // Stop the function here
    }

    // If product has no stock (or not found, although it should be), show the confirmation modal
    setProductToDeleteId(id);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDeleteId) {
      try {
        await productService.delete(productToDeleteId);
        console.log('productService.delete successful.');
        message.success('Producto eliminado correctamente');
        fetchProducts();
      } catch (error) {
        console.error('Catch in handleDelete:', error);
        message.error(error.response?.data?.message || 'Error al eliminar el producto');
      } finally {
        setIsDeleteModalVisible(false);
        setProductToDeleteId(null);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Valores del formulario:', values); // Log para depuración
      
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
      message.error(error.response?.data?.message || 'Error al guardar el producto');
    }
  };

  return (
    <div className="productos-container">
      <div className="productos-header">
        <h2>Gestión de Productos</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
        >
          Nuevo Producto
        </Button>
      </div>

      <div className="search-bar">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Buscar por nombre"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filtrar por categoría"
              value={searchCategory}
              onChange={setSearchCategory}
              allowClear
            >
              {categories.map(cat => (
                <Option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Button type="primary" onClick={handleSearch} block>
              Buscar
            </Button>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="productId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} productos`
        }}
      />

      {/* Modal de confirmación de eliminación */}
      <Modal
        title="Confirmar eliminación"
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Eliminar"
        okType="danger"
        cancelText="Cancelar"
      >
        <p>¿Está seguro que desea eliminar este producto?</p>
      </Modal>
      <Modal
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="productCode"
            label="Código de Producto"
            rules={[
              { required: true, message: 'Por favor ingrese el código de producto' },
              { min: 1, message: 'El código de producto no puede estar vacío' }
            ]}

          >
            {/* El campo de código de producto es de solo lectura cuando se edita un producto existente */}
            <Input maxLength={50} placeholder="Ingrese el código del producto" readOnly={editingProduct !== null} />
          </Form.Item>
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descripción"
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Categoría"
            rules={[{ required: true, message: 'Por favor seleccione una categoría' }]}
          >
            <Select>
              {categories.map(cat => (
                <Option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="minimumStock"
            label="Stock Mínimo"
            rules={[{ required: true, message: 'Por favor ingrese el stock mínimo' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Productos;