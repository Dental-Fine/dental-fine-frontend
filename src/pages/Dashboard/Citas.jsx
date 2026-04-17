import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, CalendarDays } from 'lucide-react';
import ModalCita from '../../components/Modales/ModalCita';

export default function Citas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  
  // Lista de citas (simulando los datos de la tabla 'Citas' de tu BD)
  const [citas, setCitas] = useState([
    { id_cita: 1, fecha: '2026-04-17', hora: '09:00', hora_fin: '10:00', id_paciente: 101, id_dentista: 5, estado: 'Confirmada', observaciones: 'Limpieza' },
    { id_cita: 2, fecha: '2026-04-17', hora: '11:30', hora_fin: '12:30', id_paciente: 105, id_dentista: 3, estado: 'Pendiente', observaciones: 'Revisión' },
  ]);

  const abrirModalNuevo = () => {
    setCitaSeleccionada(null); // Limpiamos para que sea "Nuevo"
    setIsModalOpen(true);
  };

  const abrirModalEditar = (cita) => {
    setCitaSeleccionada(cita); // Pasamos la cita para que sea "Editar"
    setIsModalOpen(true);
  };

  const eliminarCita = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta cita? (DELETE FROM Citas...)')) {
      setCitas(citas.filter(c => c.id_cita !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Citas</h1>
          <p className="text-slate-500">Control total del cronograma clínico.</p>
        </div>
        <button 
          onClick={abrirModalNuevo}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-medium transition-all shadow-lg flex items-center gap-2"
        >
          <Plus size={20} /> Agendar Cita
        </button>
      </div>

      {/* Tabla con formato de Base de Datos */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-sm font-semibold text-slate-500 uppercase">ID</th>
              <th className="p-5 text-sm font-semibold text-slate-500 uppercase">Paciente/Doc</th>
              <th className="p-5 text-sm font-semibold text-slate-500 uppercase">Horario</th>
              <th className="p-5 text-sm font-semibold text-slate-500 uppercase">Estado</th>
              <th className="p-5 text-sm font-semibold text-slate-500 text-center uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {citas.map((cita) => (
              <tr key={cita.id_cita} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-5 text-sm font-bold text-indigo-600">#{cita.id_cita}</td>
                <td className="p-5 text-sm">
                  <div className="text-slate-900 font-medium">Paciente ID: {cita.id_paciente}</div>
                  <div className="text-slate-500 text-xs">Dentista ID: {cita.id_dentista}</div>
                </td>
                <td className="p-5 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CalendarDays size={14} /> {cita.fecha}
                  </div>
                  <div className="text-slate-500 text-xs ml-5">{cita.hora} - {cita.hora_fin}</div>
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                    cita.estado === 'Confirmada' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                    {cita.estado}
                  </span>
                </td>
                <td className="p-5 text-center space-x-2">
                  <button onClick={() => abrirModalEditar(cita)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => eliminarCita(cita.id_cita)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reutilizamos el modal para Crear y Editar */}
      <ModalCita 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        citaEditando={citaSeleccionada}
      />
    </div>
  );
}