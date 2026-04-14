import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas de Autenticación
import { Login } from '../pages/Auth/Login';

// Páginas del Personal / Admin (Las que ya tenías)
import { Inicio } from '../pages/Dashboard/Inicio';

// Páginas y Layout del Paciente (Las nuevas)
import { PortalPacienteLayout } from '../layouts/PortalPacienteLayout';
import { DashboardPaciente } from '../pages/Pacientes/DashboardPaciente';

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
                            <div className="text-2xl font-bold">Aquí irá la pantalla de Citas</div>
                        </PortalPacienteLayout>
                    } 
                />
            </Routes>
        </BrowserRouter>
    );
};