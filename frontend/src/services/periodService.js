import api from './api'; // Import the configured axios instance

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
        const response = await api.post('/periods/closePeriod', { monthYear });
        console.log('periodService: Resultado de closePeriod', response.data);

        if (!response.ok) {
            // Intentar parsear como JSON si el error es un objeto JSON
            try {
                const errorData = JSON.parse(resultText);
                throw new Error(errorData.message || `Error al cerrar el período: ${response.status} ${response.statusText}`);
            } catch (e) {
                 // Si no es JSON, usar el texto plano del error
                 throw new Error(resultText || `Error al cerrar el período: ${response.status} ${response.statusText}`);
            }
        }

        // Devolver el texto de respuesta (podría ser un mensaje de éxito)
        return resultText;

    } catch (error) {
        console.error('periodService: Error en closePeriod:', error);
        throw error; // Propagar el error para ser manejado por el componente
    }
};