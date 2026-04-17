import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas de Autenticación
import { Login } from '../pages/Auth/Login';

// Páginas del Personal / Admin (Las que ya tenías)
import { Inicio } from '../pages/Dashboard/Inicio';

// Páginas y Layout del Paciente (Las nuevas)
import { PortalPacienteLayout } from '../layouts/PortalPacienteLayout';
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

              
                <Route path="/admin/dashboard" element={<Inicio />} />

            
                <Route 
                    path="/paciente/inicio" 
                    element={
                        <PortalPacienteLayout>
                            <DashboardPaciente />
                        </PortalPacienteLayout>
                    } 
                />
                
                <Route 
                    path="/paciente/citas" 
                    element={
                        <PortalPacienteLayout>
                            <MisCitas />
                        </PortalPacienteLayout>
                    } 
                />

                <Route 
                    path="/paciente/perfil" 
                    element={
                        <PortalPacienteLayout>
                            <PerfilPaciente />
                        </PortalPacienteLayout>
                    } 
                />

                <Route 
                    path="/paciente/agendar" 
                    element={
                        <PortalPacienteLayout>
                        <NuevaCita />
                        </PortalPacienteLayout>
                    } 
                />
                <Route 
                    path="/paciente/expediente" 
                    element={
                    <PortalPacienteLayout>
                        <MiExpediente />
                    </PortalPacienteLayout>
                    } 
                />
                <Route
                    path="/paciente/documentos"
                    element={
                    <PortalPacienteLayout>
                        <MisDocumentos />
                    </PortalPacienteLayout>
                    }
                />


      
                {/* Ruta 404 - Por si se pierden */}
                <Route path="*" element={<div className="p-10 font-black text-center">404 - Página no encontrada</div>} />
                </Routes>
        </BrowserRouter>
    );
};