import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Páginas de Autenticación
import { Login } from '../pages/Auth/Login';

// Layouts
import MainLayout from '../layouts/MainLayout';
import { PortalPacienteLayout } from '../layouts/PortalPacienteLayout';

// Páginas del Personal / Admin
import Inicio from '../pages/Dashboard/Inicio';
import { GestorClinico } from '../pages/Dashboard/GestorClinico';
import Servicios from '../pages/Dashboard/Servicios';
import Expedientes from '../pages/Dashboard/Expedientes';
import ExpedienteDetalle from '../pages/Dashboard/ExpedienteDetalle';
import Pagos from '../pages/Dashboard/Pagos';

// Páginas del Paciente
import { DashboardPaciente } from '../pages/Pacientes/DashboardPaciente';
import { PerfilPaciente } from '../pages/Pacientes/PerfilPaciente';
import { MiExpediente } from "../pages/Pacientes/MiExpediente";
import { MisDocumentos } from "../pages/Pacientes/MisDocumentos";
import { MisCitas } from "../pages/Citas/MisCitas";
import { NuevaCita } from "../pages/Citas/NuevaCita";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />

                {/* Rutas del Administrador / Recepción / Dentista */}
                <Route path="/admin" element={<MainLayout />}>
                    <Route path="dashboard" element={<Inicio />} />
                    <Route path="gestor-clinico" element={<GestorClinico />} />
                    <Route path="servicios" element={<Servicios />} /> 
                    <Route path="expedientes" element={<Expedientes />} />
                    <Route path="expediente/:id" element={<ExpedienteDetalle />} /> 
                    <Route path="pagos" element={<Pagos />} /> 
                </Route>

                {/* Rutas del Paciente */}
                <Route path="/paciente/inicio" element={<PortalPacienteLayout><DashboardPaciente /></PortalPacienteLayout>} />
                <Route path="/paciente/citas" element={<PortalPacienteLayout><MisCitas /></PortalPacienteLayout>} />
                <Route path="/paciente/perfil" element={<PortalPacienteLayout><PerfilPaciente /></PortalPacienteLayout>} />
                <Route path="/paciente/agendar" element={<PortalPacienteLayout><NuevaCita /></PortalPacienteLayout>} />
                <Route path="/paciente/expediente" element={<PortalPacienteLayout><MiExpediente /></PortalPacienteLayout>} />
                <Route path="/paciente/documentos" element={<PortalPacienteLayout><MisDocumentos /></PortalPacienteLayout>} />

                {/* Ruta 404 - Redirección o Error */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};