import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Validación simple según requerimientos
      if (username === 'admin' && password === '1234') {
        // Simular llamada al servicio de autenticación
        const userData = await login(username, password);
        
        // Guardar token en localStorage
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirigir al dashboard
        navigate('/dashboard');
      } else {
        setError('Credenciales incorrectas. Usuario: admin, Contraseña: 1234');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor intente nuevamente.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>INICIAR SESIÓN</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Clave:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions">
            <button type="submit">Ingresar</button>
            <a href="#forgot-password" className="forgot-password">¿Olvidó su clave?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;