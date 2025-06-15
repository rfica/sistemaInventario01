// frontend/src/services/productService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Ajustar según configuración del backend
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar el token de autenticación
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
      // Si el token expiró, redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const productService = {
  getAll: async () => {
    try {
      const response = await api.get('/products');
      // Normalizar los datos para el frontend
      return response.data.map(product => ({
        productId: product.ProductId || product.productId,
        productCode: product.ProductCode || product.productCode,
        name: product.Name || product.name,
        description: product.Description || product.description,
        categoryId: product.CategoryId || product.categoryId,
        minimumStock: product.MinimumStock || product.minimumStock,
        createdAt: product.CreatedAt || product.createdAt
      }));
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  create: async (product) => {
    try {
      console.log('Datos a enviar al backend:', product); // Log para depuración
      const response = await api.post('/products', {
        productCode: product.productCode,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        minimumStock: product.minimumStock
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  update: async (id, productData) => {
    try {
      console.log('Datos a enviar al backend:', productData); // Log para depuración
      const response = await api.put(`/products/${id}`, {
        productCode: productData.productCode,
        name: productData.name,
        description: productData.description,
        categoryId: productData.categoryId,
        minimumStock: productData.minimumStock
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/products/${id}`);
      return true;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  },

  // Función adicional para buscar productos según la documentación
  search: async (queryText) => {
    try {
      const response = await api.get('/products/search', { 
        params: {
          query: queryText
        }
      });
      // Normalizar los datos de la búsqueda
      const data = response.data.data || response.data;
      return data.map(product => ({
        productId: product.ProductId || product.productId,
        productCode: product.ProductCode || product.productCode,
        name: product.Name || product.name,
        description: product.Description || product.description,
        categoryId: product.CategoryId || product.categoryId,
        minimumStock: product.MinimumStock || product.minimumStock,
        createdAt: product.CreatedAt || product.createdAt
      }));
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw error;
    }
  }
};

export default productService;