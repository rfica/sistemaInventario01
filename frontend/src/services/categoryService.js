import axios from 'axios';

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
      // Si el token expiró, redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const categoryService = {
  getAll: async () => {
    try {
      const response = await api.get('/categories');
      // Normalizar los datos para el frontend
      return response.data.map(category => ({
        categoryId: category.CategoryId || category.categoryId,
        name: category.Name || category.name,
        description: category.Description || category.description
      }));
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },
  create: async (category) => {
    try {
      const response = await api.post('/categories', {
        Name: category.name,
        Description: category.description
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  },
  update: async (id, category) => {
    try {
      const response = await api.put(`/categories/${id}`, {
        Name: category.name,
        Description: category.description
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      return true;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  }
};

export default categoryService; 