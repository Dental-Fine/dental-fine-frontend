import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import ModalCita from '../../components/Modales/ModalCita';

export default function DashboardRecepcion() {
  // --- LÓGICA DE FECHAS ---
  const hoy = new Date();
  const [fechaActual, setFechaActual] = useState(new Date(2026, 3, 1)); // Abril 2026 para pruebas
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date(2026, 3, 16)); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [citaEditando, setCitaEditando] = useState(null);

  // Mock de datos (Simulando la BD Citas)
  const [citas, setCitas] = useState([
    { id_cita: 1, fecha: '2026-04-16', hora: '09:00', paciente: 'Valeria G.', doctor: 'Dr. López', estado: 'Atendida' },
    { id_cita: 2, fecha: '2026-04-16', hora: '10:30', paciente: 'Carlos R.', doctor: 'Dra. Martínez', estado: 'Pendiente' },
    { id_cita: 3, fecha: '2026-04-18', hora: '12:30', paciente: 'Jorge P.', doctor: 'Dra. Martínez', estado: 'Cancelada' },
  ]);

  // Generar calendario
  const diasMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).getDate();
  const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).getDay();
  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const formatearFecha = (dia) => `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  
  const strFechaSel = formatearFecha(fechaSeleccionada.getDate());
  const citasDelDia = citas.filter(c => c.fecha === strFechaSel);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Panel de Control</h1>
          <p className="text-slate-500">Gestión unificada de agenda y pacientes.</p>
        </div>
        <button onClick={() => { setCitaEditando(null); setIsModalOpen(true); }} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2">
          <Plus size={20} /> Agendar Cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CALENDARIO */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-800 text-lg">{nombresMeses[fechaActual.getMonth()]} {fechaActual.getFullYear()}</h2>
            <div className="flex gap-1">
              <button onClick={() => setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronLeft size={18}/></button>
              <button onClick={() => setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight size={18}/></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: primerDiaMes }).map((_, i) => <div key={i} />)}
            {Array.from({ length: diasMes }).map((_, i) => {
              const dia = i + 1;
              const fStr = formatearFecha(dia);
              const isSel = fechaSeleccionada.getDate() === dia && fechaSeleccionada.getMonth() === fechaActual.getMonth();
              const tieneCitas = citas.some(c => c.fecha === fStr && c.estado !== 'Cancelada');
              const tieneCanceladas = citas.some(c => c.fecha === fStr && c.estado === 'Cancelada');

              return (
                <button key={dia} onClick={() => setFechaSeleccionada(new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia))}
                  className={`relative aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${isSel ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {dia}
                  <div className="absolute bottom-1 flex gap-0.5">
                    {tieneCitas && <span className={`w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white' : 'bg-emerald-500'}`} />}
                    {tieneCanceladas && <span className={`w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white/50' : 'bg-red-500'}`} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DETALLE DEL DÍA */}
        <div className="lg:col-span-8 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon size={18} className="text-indigo-600" /> Agenda del {fechaSeleccionada.getDate()} de {nombresMeses[fechaSeleccionada.getMonth()]}
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-6">
            {citasDelDia.length > 0 ? (
              <div className="space-y-4">
                {citasDelDia.map(c => (
                  <div key={c.id_cita} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg text-sm">{c.hora}</div>
                      <div>
                        <div className="font-bold text-slate-900">{c.paciente}</div>
                        <div className="text-xs text-slate-500">{c.doctor}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${c.estado === 'Cancelada' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {c.estado}
                      </span>
                      <button onClick={() => { setCitaEditando(c); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <AlertCircle size={40} className="mb-2 opacity-20" />
                <p className="text-sm italic">No hay actividad registrada para este día.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ModalCita isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} citaEditando={citaEditando} />
    </div>
  );
}