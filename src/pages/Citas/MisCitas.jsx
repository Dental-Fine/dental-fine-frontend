import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { DetalleCitaModal } from '../../components/ui/DetalleCitaModal';
import { CitaCard } from '../../components/ui/CitaCard';
import { api } from '../../services/api'; // Importamos tu axios configurado

import { 
  Calendar, Clock, User, Stethoscope, 
  Filter, Search, Plus, MoreVertical,
  CheckCircle2, XCircle, AlertCircle, Loader2
} from 'lucide-react';

export const MisCitas = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('proximas'); 
  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  // ESTADOS PARA EL BACKEND
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // 1. FUNCIÓN PARA OBTENER LAS CITAS
  const cargarCitas = async () => {
    try {
      setCargando(true);
      // Llamamos al endpoint (ajusta la ruta según el Controller de tu amigo)
      const respuesta = await api.get('/citas/paciente/1');
      
      // Adaptamos los datos del Backend (Java) a tu formato de Frontend (Mocks)
      const citasFormateadas = respuesta.data.map(c => ({
        id: c.id,
        // Separamos la fecha y hora del LocalDateTime de Java
        fechaOriginal: c.fecha, // Guardamos el formato original por si se necesita
        fecha: c.fecha ? c.fecha.split('T')[0] : 'Sin fecha',
        hora: c.fecha ? c.fecha.split('T')[1].substring(0, 5) : '--:--',
        doctor: c.dentista ? `Dr. ${c.dentista.nombre}` : 'Por asignar',
        servicio: c.tipoServicio ? c.tipoServicio.nombre : (c.nombre || 'Consulta General'),
        clinica: c.clinica ? c.clinica.nombre : 'Clínica Central',
        ubicacion: c.clinica ? c.clinica.ubicacion : 'Ubicación no disponible',
        estado: c.estado, // Viene como 'PENDIENTE', 'ATENDIDA', etc.
        monto: c.monto,
        notas: "Consulta recuperada del sistema."
      }));

      setCitas(citasFormateadas);
    } catch (err) {
      console.error("Error al cargar citas:", err);
      setError("No se pudieron cargar las citas. Verifica que el servidor esté activo.");
    } finally {
      setCargando(false);
    }
  };

  const handleCancelarCita = async (citaId) => {
    // Confirmación nativa simple para evitar cancelaciones por error
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.")) return;

    try {
      setCargando(true);
      setModalAbierto(false); // Cerramos el modal
      
      // OJO: Verifica con el backend cuál es el endpoint exacto que creó para actualizar el estado. 
      // Según el código de su Service, debería ser algo similar a esto:
      await api.put(`/citas/${citaId}/estado?estado=CANCELADA`);
      
      // Recargamos la lista para que la cita desaparezca o cambie a estado CANCELADA
      await cargarCitas(); 
    } catch (err) {
      console.error(err);
      alert("Hubo un error al cancelar la cita. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  // 2. LÓGICA DE FILTRADO (Adaptada a los ENUMS de Java que suelen ser MAYÚSCULAS)
  const citasFiltradas = citas.filter(c => {
    if (filtro === 'proximas') {
      return c.estado === 'PENDIENTE'; // Ajustado al Enum de Java
    } else {
      return c.estado === 'ATENDIDA' || c.estado === 'COMPLETADA';
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-dark tracking-tight">Mis Citas</h2>
          <p className="text-slate-500 font-medium mt-1">Administra tus visitas programadas y consulta tu historial médico.</p>
        </div>
        <button 
          onClick={() => navigate('/paciente/agendar')}
          className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-3 cursor-pointer group"
        >
          <Plus size={22} className="group-hover:rotate-90 transition-transform" />
          Agendar Nueva Cita
        </button>
      </div>

      {/* FILTROS Y BUSCADOR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setFiltro('proximas')}
            className={`flex-1 md:px-6 py-2 rounded-lg text-sm font-black transition-all ${filtro === 'proximas' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-dark'}`}
          >
            Próximas
          </button>
          <button 
            onClick={() => setFiltro('historial')}
            className={`flex-1 md:px-6 py-2 rounded-lg text-sm font-black transition-all ${filtro === 'historial' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-dark'}`}
          >
            Historial
          </button>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por doctor o servicio..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
          />
        </div>
      </div>

      {/* MANEJO DE ESTADOS (CARGANDO / ERROR) */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={40} className="animate-spin mb-4 text-primary" />
          <p className="font-bold">Cargando tus citas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-8 rounded-[32px] border border-red-100 text-center">
          <AlertCircle size={40} className="mx-auto mb-4" />
          <p className="font-black text-lg">{error}</p>
          <button onClick={cargarCitas} className="mt-4 text-sm font-bold underline">Reintentar conexión</button>
        </div>
      ) : (
        /* LISTADO DE CITAS (CARDS) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {citasFiltradas.length > 0 ? (
            citasFiltradas.map((cita) => (
              <CitaCard 
                key={cita.id} 
                cita={cita} 
                onVerDetalles={() => {
                  setCitaSeleccionada(cita);
                  setModalAbierto(true);
                }} 
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
              <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 font-bold">No hay citas en esta categoría</p>
            </div>
          )}
        </div>
      )}

      {/* FOOTER INFO */}
      {!cargando && !error && (
        <div className="flex justify-center pt-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Sincronizado con el servidor local
          </p>
        </div>
      )}

      {/* MODAL DE DETALLE DE CITA */}
      <DetalleCitaModal 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        cita={citaSeleccionada} 
        onCancelar={handleCancelarCita} // <--- NUEVO: Le pasamos la función al modal
      />
    </div>
  );
};