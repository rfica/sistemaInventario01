import api from './productService'; // Import the configured axios instance

export const getClosedPeriods = async () => {
    try {
        console.log('periodService: Iniciando getClosedPeriods');
        const response = await api.get('/periods/closed');
        console.log('periodService: Resultado de getClosedPeriods', response.data);
        return response.data;
    } catch (error) {
        console.error('periodService: Error en getClosedPeriods:', error);
        throw error; // Propagar el error para ser manejado por el componente
    }
};

export const closePeriod = async (monthYear) => {
    try {
        console.log('periodService: Iniciando closePeriod con monthYear', monthYear);
        const response = await api.post('/periods/closePeriod', { monthYear }); // Axios ya maneja la baseURL, headers y body
        console.log('periodService: Resultado de closePeriod', response.data); // Axios devuelve la data directamente
        // Axios interceptor manejará errores como 401 automáticamente
        return response.data; // O response.request.responseText; if backend sends plain text

    } catch (error) {
        console.error('periodService: Error en closePeriod:', error);
        throw error; // Propagar el error para ser manejado por el componente
    }
};