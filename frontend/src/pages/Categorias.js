import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import categoryService from '../services/categoryService';

const Categorias = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  // Estados para el modal de borrado
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
      console.log('categories:', data); // LOG para depuración
    } catch (error) {
      message.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setIsModalVisible(true);
  };

  // Nuevo handleDelete: solo abre el modal
  const handleDelete = (id) => {
    setCategoryToDelete(id);
    setDeleteModalVisible(true);
  };

  // Nueva función para confirmar el borrado
  const confirmDelete = async () => {
    try {
      await categoryService.delete(categoryToDelete);
      message.success('Categoría eliminada correctamente');
      setDeleteModalVisible(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      const backendMsg = error.response?.data?.message;
      setDeleteModalVisible(false);
      setCategoryToDelete(null);
      setTimeout(() => {
        alert(backendMsg || 'Error al eliminar la categoría');
      }, 100);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        await categoryService.update(editingCategory.categoryId, values);
        message.success('Categoría actualizada correctamente');
      } else {
        await categoryService.create(values);
        message.success('Categoría creada correctamente');
      }
      setIsModalVisible(false);
      fetchCategories();
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al guardar la categoría');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'categoryId',
      key: 'categoryId',
      responsive: ['md'],
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      responsive: ['md'],
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.categoryId)} danger />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <h2>Gestión de Categorías</h2>
        </Col>
        <Col xs={24} md={12} style={{ textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Agregar Categoría
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={categories}
        rowKey="categoryId"
        loading={loading}
        scroll={{ x: true }}
        pagination={{ pageSize: 8, showSizeChanger: false }}
      />
      <Modal
        title={editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={editingCategory ? 'Actualizar' : 'Crear'}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Ingrese el nombre de la categoría' }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Descripción"
            rules={[{ required: true, message: 'Ingrese la descripción' }]}
          >
            <Input.TextArea rows={2} maxLength={255} />
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal de confirmación de borrado */}
      <Modal
        title="Confirmar eliminación"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => { setDeleteModalVisible(false); setCategoryToDelete(null); }}
        okText="Eliminar"
        okType="danger"
        cancelText="Cancelar"
        destroyOnClose
      >
        <p>¿Está seguro que desea eliminar esta categoría?</p>
      </Modal>
    </div>
  );
};

export default Categorias; 