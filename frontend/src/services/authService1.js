// Simulación del servicio de autenticación usando mock data
// frontend/src/services/authService.js

import mockUser from '../mocks/mockUser.json';


// Función para simular inicio de sesión
export const login = async (username, password) => {
  // Simulamos un retraso de red
  await new Promise(resolve => setTimeout(resolve, 500));

  // Validamos contra el mock
  if (username === mockUser.username && password === mockUser.password) {
    localStorage.setItem('token', mockUser.token);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return mockUser;
  } else {
    throw new Error("Credenciales incorrectas");
  }
};

// Función para obtener el usuario actual desde localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Función para cerrar sesión
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};



