// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login'; 
import MainLayout from '../layouts/MainLayout'; 
import DashboardRecepcion from '../pages/Dashboard/DashboardRecepcion';
import Expedientes from '../pages/Dashboard/Expedientes';
import ExpedienteDetalle from '../pages/Dashboard/ExpedienteDetalle';

// import Pagos from '../pages/Dashboard/Pagos';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pantalla de acceso */}
        <Route path="/login" element={<Login />} />
        
        {/* Estructura principal del Dashboard */}
        <Route path="/dashboard" element={<MainLayout />}>
          {/* Vista inicial: Recepción y Agenda fusionadas */}
          <Route index element={<DashboardRecepcion />} />
          
          {/* Vistas de Expedientes */}
          <Route path="expedientes" element={<Expedientes />} />
          <Route path="expediente/:id" element={<ExpedienteDetalle />} /> 
          
          {/* Vista de Pagos (Comentada temporalmente) */}
          {/* <Route path="pagos" element={<Pagos />} /> */}
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}