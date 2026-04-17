import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DetalleCitaModal } from '../../components/ui/DetalleCitaModal';
import { CitaCard } from '../../components/ui/CitaCard';
import { 
  Calendar, Clock, User, Stethoscope, 
  Filter, Search, Plus, MoreVertical,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

export const MisCitas = () => {

  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('proximas'); // proximas | historial

  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  // Mocks basados en tu tabla 'Citas'
  const citas = [
    { 
      id: 1, 
      fecha: "2026-04-15", 
      hora: "10:00", 
      doctor: "Dr. Iván Ramos", 
      servicio: "Limpieza General", 
      estado: "Pendiente", // Según tu CHECK(estado IN(...))
      notas: "Ayuno de 2 horas recomendado."
    },
    { 
      id: 2, 
      fecha: "2026-03-10", 
      hora: "16:30", 
      doctor: "Dra. Elena Solís", 
      servicio: "Resina Estética", 
      estado: "Atendida",
      notas: "Tratamiento completado con éxito."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* HEADER: Título y Botón Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-dark tracking-tight">Mis Citas</h2>
          <p className="text-slate-500 font-medium mt-1">Administra tus visitas programadas y consulta tu historial médico.</p>
        </div>
        <button 
        onClick={() => navigate('/paciente/agendar')}
        className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-3 cursor-pointer group">
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

      {/* LISTADO DE CITAS (CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {citas.filter(c => filtro === 'proximas' ? c.estado === 'Pendiente' : c.estado === 'Atendida').map((cita) => (
            <CitaCard 
            key={cita.id} 
            cita={cita} 
            onVerDetalles={() => {
              setCitaSeleccionada(cita);
              setModalAbierto(true);
            }} 
          />

        ))}
      </div>

      {/* PAGINACIÓN O CARGA (Opcional) */}
      <div className="flex justify-center pt-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mostrando {citas.length} citas registradas</p>
      </div>


        {/* MODAL DE DETALLE DE CITA */}
        <DetalleCitaModal 
          isOpen={modalAbierto} 
          onClose={() => setModalAbierto(false)} 
          cita={citaSeleccionada} 
        />
    </div>
  );
};