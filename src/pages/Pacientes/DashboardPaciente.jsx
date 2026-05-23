import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Activity, FileText } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export const DashboardPaciente = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ id: null, nombre: 'Paciente' });

  const [resumen, setResumen] = useState({
    proximaCita: {
      fecha: "--",
      tratamiento: "Sin citas pendientes",
      hora: "--:--",
      ubicacion: "--"
    },
    tratamientosActivos: {
      cantidad: 0,
      detalle: "Ninguno"
    }
  });

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario_dental_fine');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        // En el MVP el ID del paciente está hardcodeado a 1
        const respuesta = await api.get('/citas/paciente/1');
        const citas = respuesta.data;
        
        // Filtramos las citas pendientes
        const pendientes = citas.filter(c => c.estado === 'PENDIENTE');
        pendientes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        if (pendientes.length > 0) {
          const proxima = pendientes[0];
          const dateObj = new Date(proxima.fecha);
          const fechaStr = dateObj.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
          const horaStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          setResumen({
            proximaCita: {
              fecha: fechaStr,
              tratamiento: proxima.tipoServicio ? proxima.tipoServicio.nombre : (proxima.nombre || 'Consulta General'),
              hora: horaStr,
              ubicacion: proxima.clinica ? proxima.clinica.nombre : 'Clínica Central'
            },
            tratamientosActivos: {
              cantidad: 1, // Puedes calcular esto con otra lógica si existe en BD
              detalle: "Tratamiento Activo"
            }
          });
        }
      } catch (err) {
        console.error("Error cargando citas para el resumen:", err);
      }
    };
    cargarResumen();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-dark">¡Hola, {usuario.nombre}!</h2>
          <p className="text-slate-500 mt-1">Bienvenido a tu portal de paciente.</p>
        </div>
        <button 
        onClick={() => navigate('/paciente/agendar')}
        className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all flex items-center gap-2 cursor-pointer">
          <Calendar size={20} />
          Nueva Cita
        </button>
      </div>

      {/* Tarjetas de Resumen (Cards) dinámicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card: Próxima Cita */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="bg-blue-100 p-3 rounded-lg text-primary">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Próxima Cita</p>
            <p className="text-lg font-bold text-dark mt-1">{resumen.proximaCita.fecha}</p>
            <p className="text-sm text-primary font-medium mt-1">{resumen.proximaCita.tratamiento}</p>
          </div>
        </div>

        {/* Card: Hora y Ubicación */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Hora</p>
            <p className="text-lg font-bold text-dark mt-1">{resumen.proximaCita.hora}</p>
            <p className="text-sm text-slate-400 mt-1">{resumen.proximaCita.ubicacion}</p>
          </div>
        </div>

        {/* Card: Tratamientos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tratamientos Activos</p>
            <p className="text-lg font-bold text-dark mt-1">{resumen.tratamientosActivos.cantidad} en curso</p>
            <p className="text-sm text-slate-400 mt-1">{resumen.tratamientosActivos.detalle}</p>
          </div>
        </div>
      </div>

      {/* Historial Reciente */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-dark mb-4">Historial Reciente</h3>
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <FileText size={48} className="mb-4 text-slate-300" />
          <p className="font-medium text-slate-500">Aún no hay registros en tu historial clínico.</p>
          <p className="text-sm mt-1">Tus consultas y tratamientos aparecerán aquí.</p>
        </div>
      </div>
    </div>
  );
};