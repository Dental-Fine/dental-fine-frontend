import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Activity, FileText } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export const DashboardPaciente = () => {
  const navigate= useNavigate();
  const [usuario, setUsuario] = useState({ id: null, nombre: 'Paciente' });

  // 1. Estado para el resumen del dashboard preparado para recibir datos reales
  const [resumen, setResumen] = useState({
    proximaCita: {
      fecha: "12 Octubre, 2026",
      tratamiento: "Limpieza General",
      hora: "10:30 AM",
      ubicacion: "Consultorio 2"
    },
    tratamientosActivos: {
      cantidad: 1,
      detalle: "Ortodoncia"
    }
  });

  // 2. Al cargar la página, buscamos en el localStorage
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario_dental_fine');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  // 3. (OPCIONAL) Código preparado para cuando el backend tenga el endpoint de resumen:
  /*
  useEffect(() => {
    const cargarResumen = async () => {
      if (!usuario.id) return;
      try {
        const respuesta = await api.get(`/pacientes/${usuario.id}/resumen`);
        setResumen(respuesta.data);
      } catch (err) {
        console.error("Error cargando resumen:", err);
      }
    };
    cargarResumen();
  }, [usuario.id]);
  */

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