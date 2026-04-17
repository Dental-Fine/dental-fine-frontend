import { Clock, UserCheck, XCircle, ChevronRight, Activity } from 'lucide-react';

export default function DashboardRecepcion() {
  // Mock basado en el script SQL (Citas JOIN Pacientes JOIN Usuarios)
  const metricas = { total: 15, atendidas: 4, canceladas: 1, enEspera: 10 };
  
  const citasHoy = [
    { id: 1, paciente: 'Valeria G.', hora: '09:00', estado: 'Atendida', dentista: 'Dr. López', tipo: 'Limpieza' },
    { id: 2, paciente: 'Carlos R.', hora: '10:30', estado: 'Pendiente', dentista: 'Dra. Martínez', tipo: 'Extracción' },
    { id: 3, paciente: 'Ana M.', hora: '11:00', estado: 'En sala', dentista: 'Dr. López', tipo: 'Revisión' },
    { id: 4, paciente: 'Jorge P.', hora: '12:30', estado: 'Cancelada', dentista: 'Dra. Martínez', tipo: 'Resina' },
  ];

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
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recepción</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <Clock size={16} /> Hoy es 16 de Abril, 2026
          </p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-medium transition-all shadow-lg shadow-indigo-600/20 hover:scale-105">
          + Nueva Cita Rápida
        </button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Citas Hoy', valor: metricas.total, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'En Espera', valor: metricas.enEspera, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Atendidas', valor: metricas.atendidas, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Canceladas', valor: metricas.canceladas, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((metrica, i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-2xl ${metrica.bg} ${metrica.color}`}>
              <metrica.icon size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{metrica.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrica.valor}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Agenda del Día */}
      <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Agenda Activa</h2>
          <button className="text-indigo-600 font-medium text-sm hover:underline">Ver calendario completo</button>
        </div>
        
        <div className="divide-y divide-slate-100">
          {citasHoy.map((cita) => (
            <div key={cita.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">{cita.hora}</p>
                </div>
                <div className="h-10 w-px bg-slate-200"></div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{cita.paciente}</h4>
                  <p className="text-slate-500 text-sm">{cita.tipo} • {cita.dentista}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`px-4 py-1.5 rounded-xl text-sm font-bold border ${getStatusColor(cita.estado)}`}>
                  {cita.estado}
                </span>
                <button className="p-2 text-slate-400 group-hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}