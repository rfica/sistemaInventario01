import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, InputNumber, Select, Button, message, Space, Card } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import moment from 'moment';
import productService from '../services/productService';
import stockService from '../services/stockService';
import debounce from 'lodash/debounce';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const { Option } = Select;

const MOVEMENT_TYPES = [
  { value: '01', label: 'Ingreso por compra' },
  { value: '02', label: 'Anulación de ingreso' },
  { value: '03', label: 'Egreso por consumo' },
  { value: '04', label: 'Anulación de egreso' }
];

const MovimientoForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentStock, setCurrentStock] = useState(null);
  const [searching, setSearching] = useState(false);
  const [movementType, setMovementType] = useState('01');
  const datePickerRef = useRef();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [accountingDate, setAccountingDate] = useState(new Date());

  // Workaround: bloquear scroll global cuando el calendario esté abierto
  useEffect(() => {
    function handleWheel(e) {
      if (calendarOpen) {
        e.preventDefault();
      }
    }
    if (calendarOpen) {
      window.addEventListener('wheel', handleWheel, { passive: false });
    } else {
      window.removeEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      window.removeEventListener('wheel', handleWheel, { passive: false });
    };
  }, [calendarOpen]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      message.error('Error al cargar productos');
    }
  };

  // Búsqueda asíncrona de productos
  const handleSearchProduct = debounce(async (value) => {
    if (!value) {
      setProducts([]);
      return;
    }
    setSearching(true);
    try {
      const data = await productService.search(value);
      setProducts(data);
    } catch (error) {
      setProducts([]);
    }
    setSearching(false);
  }, 400);

  const handleProductChange = async (productId) => {
    setSelectedProduct(productId);
    if (productId) {
      try {
        const stock = await stockService.getCurrentStock(productId);
        setCurrentStock(stock);
      } catch (error) {
        message.error('Error al obtener stock actual');
      }
    } else {
      setCurrentStock(null);
    }
  };

  // Etiquetas dinámicas según tipo de movimiento
  const isIngreso = movementType === '01' || movementType === '02';
  const docLabel = isIngreso ? 'Nro. Orden de compra' : 'Nro. Vale consumo';
  const lineLabel = isIngreso ? 'Línea Orden de compra' : 'Línea Vale consumo';

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Validar que la fecha es un objeto Date
      if (!accountingDate || isNaN(accountingDate.getTime())) {
        message.error('Seleccione una fecha contable válida');
        setLoading(false);
        return;
      }

      // Calcular la fecha en UTC antes de construir el objeto movementData
      const dateString = accountingDate.toISOString().slice(0, 10);
      const accountingDateUTC = new Date(dateString + 'T00:00:00.000Z');

      // Construir el objeto de movimiento
      const movementData = {
        productId: values.productId,
        quantity: values.quantity,
        unit: values.unit,
        amount: values.amount,
        documentNumber: values.documentNumber,
        lineNumber: values.lineNumber,
        // Usar la fecha UTC calculada
        accountingDate: accountingDateUTC,
        description: values.description,
        type: values.type,        
        // userId y createdAt se asignan en backend
      };
      // Llamar al servicio correspondiente
      console.log('MovimientoForm - Sending movementData with accountingDate:', movementData.accountingDate);
      if (["01", "02"].includes(values.type)) {
        await stockService.addStock(movementData);
      } else {
        await stockService.removeStock(movementData);
      }
      message.success('Movimiento registrado correctamente');
      form.resetFields();
      setAccountingDate(new Date());
      if (onSuccess) onSuccess();
    } catch (error) {
      console.log('CATCH EJECUTADO', error, typeof error, error?.response?.data);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message === 'Stock insuficiente'
      ) {
        const { currentStock, requiredQuantity } = error.response.data;
        alert(`Stock insuficiente. Stock actual: ${currentStock}, cantidad requerida: ${requiredQuantity}`);
      } else {
        alert(error.message || 'Error al registrar el movimiento');
      }
    }
    setLoading(false);
  };

  return (
    <Card title="Registrar Movimiento de Stock" className="movimiento-form">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: '01',
        }}
      >
        <Form.Item
          name="type"
          label="Tipo de Movimiento"
          rules={[{ required: true, message: 'Seleccione el tipo de movimiento' }]}
        >
          <Select onChange={setMovementType}>
            {MOVEMENT_TYPES.map(mt => (
              <Option key={mt.value} value={mt.value}>{mt.label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="productId"
          label="Producto"
          rules={[{ required: true, message: 'Seleccione un producto' }]}
        >
          <Select
            showSearch
            filterOption={false}
            onSearch={handleSearchProduct}
            notFoundContent={searching ? <span>Buscando...</span> : null}
            placeholder="Busque por código o nombre"
          >
            {products.map(product => (
              <Option key={product.productId} value={product.productId}>
                {product.productCode} - {product.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {currentStock !== null && (
          <div className="current-stock">
            Stock actual: <strong>{currentStock}</strong>
          </div>
        )}

        <Form.Item
          name="quantity"
          label="Cantidad"
          rules={[{ required: true, message: 'Ingrese la cantidad' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="unit"
          label="Unidad de medida"
          rules={[{ required: true, message: 'Ingrese la unidad de medida' }]}
        >
          <Input placeholder="Ej: UN, KG, LT" />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Monto $"
          rules={[{ required: true, message: 'Ingrese el monto' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="documentNumber"
          label={docLabel}
          rules={[{ required: true, message: `Ingrese el ${docLabel.toLowerCase()}` }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="lineNumber"
          label={lineLabel}
          rules={[{ required: true, message: `Ingrese la ${lineLabel.toLowerCase()}` }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="accountingDate"
          label="Fecha contable"
          rules={[{ required: true, message: 'Seleccione la fecha contable' }]}
        >
          <DatePicker
            selected={accountingDate}
            onChange={date => setAccountingDate(date)}
            dateFormat="dd/MM/yyyy"
            className="ant-input"
            placeholderText="Seleccione la fecha"
            maxDate={new Date(2100, 11, 31)}
            minDate={new Date(2000, 0, 1)}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            todayButton="Hoy"
            required
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descripción"
          rules={[{ max: 255, message: 'Máximo 255 caracteres' }]}
        >
          <Input.TextArea rows={2} placeholder="Opcional" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={movementType === '01' ? <PlusOutlined /> : <MinusOutlined />}
            >
              {movementType === '01' ? 'Registrar Entrada' : 'Registrar Salida'}
            </Button>
            <Button onClick={() => form.resetFields()}>
              Limpiar
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default MovimientoForm;