import axios from 'axios';
import { mockProduct } from '../mocks/mockProduct';
import { mockStockMovement } from '../mocks/mockStock';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const stockService = {
  // Obtener historial de movimientos
  getMovements: async () => {
    try {
      const response = await api.get('/stock');
      return response.data;
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      throw error;
    }
  },

  // Obtener un movimiento específico
  getMovement: async (id) => {
    try {
      const response = await api.get(`/stock/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener movimiento:', error);
      throw error;
    }
  },

  // Registrar entrada de stock
  addStock: async (movementData) => {
    try {
      const response = await api.post('/stock/add', {
        ProductId: movementData.productId,
        Quantity: movementData.quantity,
        Unit: movementData.unit,
        Amount: movementData.amount,
        DocumentNumber: movementData.documentNumber,
        LineNumber: movementData.lineNumber,
        AccountingDate: movementData.accountingDate,
        Description: movementData.description,
        Type: movementData.type
      });
      return response.data;
    } catch (error) {
      // Mostrar mensaje real del backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.map(e => e.msg).join(', '));
      } else {
        throw error;
      }
    }
  },

  // Registrar salida de stock
  removeStock: async (movementData) => {
    try {
      const response = await api.post('/stock/remove', {
        ProductId: movementData.productId,
        Quantity: movementData.quantity,
        Unit: movementData.unit,
        Amount: movementData.amount,
        DocumentNumber: movementData.documentNumber,
        LineNumber: movementData.lineNumber,
        AccountingDate: movementData.accountingDate,
        Description: movementData.description,
        Type: movementData.type
      });
      return response.data;
    } catch (error) {
      // Mostrar mensaje real del backend
      if (error.response?.data?.message) {
        // Si es stock insuficiente, lanza el error completo
        if (error.response.data.message === 'Stock insuficiente') {
          throw error;
        }
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.map(e => e.msg).join(', '));
      } else {
        throw error;
      }
    }
  },

  // Eliminar movimiento (borrado lógico)
  deleteMovement: async (id) => {
    try {
      await api.delete(`/stock/${id}`);
      return true;
    } catch (error) {
      console.error('Error al eliminar movimiento:', error);
      throw error;
    }
  },

  // Obtener stock actual de un producto
  getCurrentStock: async (productId) => {
    try {
      const response = await api.get(`/stock/current/${productId}`);
      return response.data.currentStock;
    } catch (error) {
      console.error('Error al obtener stock actual:', error);
      throw error;
    }
  }
};

export default stockService;