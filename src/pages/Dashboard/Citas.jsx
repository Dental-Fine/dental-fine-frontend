import { useState } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function Citas() {
  // Mock de datos alineados con los de la Recepción
  const [citas] = useState([
    { id: 1, fecha: '16 Abr 2026 - 09:00 AM', paciente: 'Valeria G.', doctor: 'Dr. López', motivo: 'Limpieza Dental', estado: 'Atendida' },
    { id: 2, fecha: '16 Abr 2026 - 10:30 AM', paciente: 'Carlos R.', doctor: 'Dra. Martínez', motivo: 'Extracción', estado: 'Pendiente' },
    { id: 3, fecha: '16 Abr 2026 - 11:00 AM', paciente: 'Ana M.', doctor: 'Dr. López', motivo: 'Revisión General', estado: 'En sala' },
    { id: 4, fecha: '17 Abr 2026 - 04:00 PM', paciente: 'Jorge P.', doctor: 'Dra. Martínez', motivo: 'Resina', estado: 'Cancelada' },
  ]);

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'Atendida': return 'bg-green-100 text-green-700 border-green-200';
      case 'En sala': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pendiente': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Cancelada': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Citas</h1>
          <p className="text-slate-500 mt-1">Administra la agenda de todos los especialistas.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-medium transition-all shadow-lg shadow-indigo-600/20 hover:scale-105 flex items-center gap-2">
          <Plus size={20} />
          Agendar Cita
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por paciente " 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-sm font-semibold text-slate-500">Fecha y Hora</th>
                <th className="p-5 text-sm font-semibold text-slate-500">Paciente</th>
                <th className="p-5 text-sm font-semibold text-slate-500">Especialista</th>
                <th className="p-5 text-sm font-semibold text-slate-500">Motivo</th>
                <th className="p-5 text-sm font-semibold text-slate-500">Estado</th>
                <th className="p-5 text-sm font-semibold text-slate-500 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {citas.map((cita) => (
                <tr key={cita.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5 text-sm text-slate-900 font-medium">{cita.fecha}</td>
                  <td className="p-5 text-sm text-slate-600">{cita.paciente}</td>
                  <td className="p-5 text-sm text-slate-600">{cita.doctor}</td>
                  <td className="p-5 text-sm text-slate-600">{cita.motivo}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${getStatusColor(cita.estado)}`}>
                      {cita.estado}
                    </span>
                  </td>
                  <td className="p-5 text-center space-x-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}