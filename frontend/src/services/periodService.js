// frontend/src/services/periodService.js

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const getClosedPeriods = async () => {
    try {
        console.log('periodService: Iniciando getClosedPeriods');
        const response = await fetch(`${API_BASE_URL}/periods/closed`);
        if (!response.ok) {
            // Intentar leer el cuerpo del error si está disponible
            const errorBody = await response.text();
            throw new Error(`Error al obtener períodos cerrados: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        return response.json();
    } catch (error) {
        console.error('periodService: Error en getClosedPeriods:', error);
        throw error; // Propagar el error para ser manejado por el componente
    }
};

export const closePeriod = async (monthYear) => {
    try {
        console.log('periodService: Iniciando closePeriod con monthYear', monthYear);
        const response = await fetch(`${API_BASE_URL}/periods/closePeriod`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Agregar encabezado de autenticación si es necesario
                // 'Authorization': `Bearer ${tu_token}`
            },
            body: JSON.stringify({ monthYear }),
        });

         const resultText = await response.text(); // Leer el cuerpo de la respuesta como texto

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