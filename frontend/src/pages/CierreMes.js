import React, { useState, useEffect } from 'react';
import * as periodService from '../services/periodService'; // Importar el servicio

const CierreMes = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [closedPeriods, setClosedPeriods] = useState([]); // This will be populated from the backend

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // Estado para mensajes de usuario (éxito o error)
  const [message, setMessage] = useState('');

  // useEffect para cargar los períodos cerrados al montar el componente
  useEffect(() => {
    fetchClosedPeriods();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // Función para obtener los períodos cerrados del backend
  const fetchClosedPeriods = async () => {
    try {
      // Usar la función del servicio para llamar al backend
      const data = await periodService.getClosedPeriods();
      setClosedPeriods(data.map(p => p.MonthYear)); // Asumiendo que el backend devuelve un array de objetos con MonthYear
    } catch (error) {
      console.error('Error al obtener períodos cerrados:', error);
      setMessage('Error al cargar los períodos cerrados.');
    }
  };

  const handleCloseMonth = async () => {
    if (!selectedMonth || !selectedYear) {
      setMessage('Por favor, selecciona un mes y un año.');
      return;
    }

    const monthYearToClose = `${selectedYear}-${selectedMonth.padStart(2, '0')}`; // Formato YYYY-MM

    try {
      // Usar la función del servicio para llamar al backend
      const responseMessage = await periodService.closePeriod(monthYearToClose);
      setMessage(responseMessage); // Mostrar el mensaje de éxito del servicio
      setSelectedMonth('');
      setSelectedYear('');
      fetchClosedPeriods(); // Recargar la lista de períodos cerrados

    } catch (error) {
      console.error('Error al cerrar el período:', error);
      setMessage(`Error al cerrar el período: ${error.message}`);
    }
  };

  // Generate options for months (1-12)
  const monthOptions = Array.from({ length: 12 }, (_, i) => (
    <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
      {new Date(0, i).toLocaleString('es', { month: 'long' })}
    </option>
  ));

  // Generate options for recent years (e.g., current year and a few past years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => (
    <option key={currentYear - i} value={currentYear - i}>
      {currentYear - i}
    </option>
  ));

  return (
    <div className="container">
      <h1>Cierre de Mes</h1>
      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Seleccionar Mes y Año para Cerrar</h2>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="month-select">Mes:</label>
            <select id="month-select" className="form-control" value={selectedMonth} onChange={handleMonthChange}>
              <option value="">Selecciona un mes</option>
              {monthOptions}
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label htmlFor="year-select">Año:</label>
            <select id="year-select" className="form-control" value={selectedYear} onChange={handleYearChange}>
              <option value="">Selecciona un año</option>
              {yearOptions}
            </select>
          </div>

          <button onClick={handleCloseMonth} className="btn btn-primary" style={{ marginTop: '20px' }}>Cerrar Mes</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <div className="card-body">
          <h2>Períodos Cerrados</h2>
          {closedPeriods.length === 0 ? (
            <p>No hay períodos cerrados registrados.</p>
          ) : (
            <ul className="list-group">
 {closedPeriods.map((period, index) => (
 <li key={index}>{period}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
export default CierreMes;