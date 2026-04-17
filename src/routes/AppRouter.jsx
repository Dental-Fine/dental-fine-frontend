// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login'; 
import MainLayout from '../layouts/MainLayout'; 
import DashboardRecepcion from '../pages/Dashboard/DashboardRecepcion';
import Citas from '../pages/Dashboard/Citas'; 

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pantalla de acceso */}
        <Route path="/login" element={<Login />} />
        
        {/* Estructura principal del Dashboard */}
        <Route path="/dashboard" element={<MainLayout />}>
          {/* Vista inicial: Recepción */}
          <Route index element={<DashboardRecepcion />} />
          
          {/* 2. Re-habilitamos la ruta de Citas */}
          <Route path="citas" element={<Citas />} /> 
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}