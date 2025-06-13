import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import PrivateRoute from './components/PrivateRoute';
import Movimientos from './pages/Movimientos';
import Categorias from './pages/Categorias';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas privadas */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/productos" 
          element={
            <PrivateRoute>
              <Productos />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/movimientos" 
          element={
            <PrivateRoute>
              <Movimientos />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/categorias" 
          element={
            <PrivateRoute>
              <Categorias />
            </PrivateRoute>
          } 
        />

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;