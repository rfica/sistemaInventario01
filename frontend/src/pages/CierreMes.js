import React, { useState, useEffect } from 'react';
import { getClosedPeriods, closePeriod } from '../services/periodService';
 // Import the functions by name
import '../styles/CierreMes.css';
const CierreMes = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [closedPeriods, setClosedPeriods] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchClosedPeriods();
  }, []);

  const fetchClosedPeriods = async () => {
 console.log('Fetching closed periods...');
    try {
      const data = await getClosedPeriods(); // Use the imported function directly
      setClosedPeriods(data.map(p => p.MonthYear));
    } catch (error) {
 console.error('Error in fetchClosedPeriods:', error); // More specific error log
      console.error('Error al obtener períodos cerrados:', error);
      setMessage('Error al cargar los períodos cerrados.');
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleCloseMonth = async () => {
 console.log('Attempting to close month...');
    if (!selectedMonth || !selectedYear) {
      setMessage('Por favor, selecciona un mes y un año.');
      return;
    }

    const monthYearToClose = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;

 console.log('Selected Month:', selectedMonth, 'Selected Year:', selectedYear, 'MonthYear to Close:', monthYearToClose);
    try {
      const responseMessage = await closePeriod(monthYearToClose); // Use the imported function directly
      setMessage(responseMessage); // Assuming the backend sends a success message as string
      setSelectedMonth('');
      setSelectedYear('');
      fetchClosedPeriods();
    } catch (error) {
 console.error('Error in handleCloseMonth:', error); // More specific error log
      console.error('Error al cerrar el período:', error);
      setMessage(`Error al cerrar el período: ${error.message}`);
 }
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => (
    <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
      {new Date(0, i).toLocaleString('es', { month: 'long' })}
    </option>
  ));

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 2060 - currentYear + 1 }, (_, i) => (
    <option key={currentYear + i} value={currentYear + i}>
      {currentYear + i}
    </option>
  ));

  return (
    <div className="container cierre-mes-page">
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
            <select 
              id="month-select" 
              className="form-control" 
              value={selectedMonth} 
              onChange={handleMonthChange}
            >
              <option value="">Selecciona un mes</option>
              {monthOptions}
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label htmlFor="year-select">Año:</label>
            <select 
              id="year-select" 
              className="form-control" 
              value={selectedYear} 
              onChange={handleYearChange}
            >
              <option value="">Selecciona un año</option>
              {yearOptions}
            </select>
          </div>

          <button 
            onClick={handleCloseMonth} 
            className="btn btn-primary" 
            style={{ marginTop: '20px' }}
          >
            Cerrar Mes
          </button>
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
                <li key={index} className="list-group-item">
                  {period}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CierreMes;