import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import MainLayout from '../layouts/MainLayout';
import Inicio from '../pages/Dashboard/Inicio';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Si van a /login, muestra el formulario */}
        <Route path="/login" element={<Login />} />

        {/* Si van a /dashboard muestra el MainLayout */}
        <Route path="/dashboard" element={<MainLayout />}>
          {/* Y por defecto, dentro del hueco del marco, muestra la pantalla de Inicio */}
          <Route index element={<Inicio />} />
        </Route>

        {/* Si escriben cualquier otra cosa, regresa al login por seguridad */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}