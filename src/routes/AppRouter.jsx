import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login'; 
import MainLayout from '../layouts/MainLayout'; 
import Inicio from '../pages/Dashboard/Inicio'; // ✨ Añadido: Panel de Control Principal
import Servicios from '../pages/Dashboard/Servicios'; // ✨ Añadido: Catálogo CRUD de Servicios
import Expedientes from '../pages/Dashboard/Expedientes';
import ExpedienteDetalle from '../pages/Dashboard/ExpedienteDetalle';
import Pagos from '../pages/Dashboard/Pagos';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pantalla de acceso global */}
        <Route path="/login" element={<Login />} />
        
        {/* Panel de administración protegido */}
        <Route path="/dashboard" element={<MainLayout />}>
          
          {/* El Panel de Control (Inicio) ahora arranca por defecto al entrar a /dashboard */}
          <Route index element={<Inicio />} />
          
          {/* Módulos complementarios y operativos */}
          <Route path="servicios" element={<Servicios />} /> {/* ✨ Nueva ruta activada */}
          <Route path="expedientes" element={<Expedientes />} />
          <Route path="expediente/:id" element={<ExpedienteDetalle />} /> 
          <Route path="pagos" element={<Pagos />} /> 
        </Route>

        {/* Redirección automática de seguridad */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}