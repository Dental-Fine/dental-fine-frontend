import React from 'react';
import { 
  X, Calendar, Clock, User, Stethoscope, 
  MapPin, Info, DollarSign, Download, 
  Map, AlertTriangle, CheckCircle2 
} from 'lucide-react';

export const DetalleCitaModal = ({ cita, isOpen, onClose, onCancelar }) => {

  if (!isOpen || !cita) return null;
  const fechaCita = new Date(cita?.fechaOriginal);
  const fechaActual = new Date();
  
  const esCancelable = 
    cita?.estado !== 'ATENDIDA' && 
    cita?.estado !== 'CANCELADA' && 
    fechaCita > fechaActual; // Solo si la cita es en el futuro

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* CONTENEDOR DEL MODAL */}
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* HEADER CON COLOR SÓLIDO */}
        <div className="bg-primary p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              <Stethoscope size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Detalles de Consulta</span>
          </div>
          <h2 className="text-3xl font-black leading-tight">{cita.servicio}</h2>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 border border-white/10">
              <Calendar size={16} />
              <span className="text-sm font-bold">{cita.fecha}</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 border border-white/10">
              <Clock size={16} />
              <span className="text-sm font-bold">{cita.hora} hrs</span>
            </div>
          </div>
        </div>

        {/* CONTENIDO DEL DETALLE */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* COLUMNA 1: Información Médica */}
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Especialista Asignado</label>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <User size={24} />
                </div>
                <div>
                  <p className="font-black text-dark leading-none">{cita.doctor}</p>
                  <p className="text-xs text-slate-500 mt-1">Odontología General</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Estado de la Cita</label>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm ${
                cita.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
              }`}>
                {cita.estado === 'Pendiente' ? <Clock size={16}/> : <CheckCircle2 size={16}/>}
                {cita.estado}
              </div>
            </div>
          </div>

          {/* COLUMNA 2: Ubicación e Instrucciones */}
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Ubicación de la Clínica</label>
              <div className="space-y-2">
                <p className="text-sm font-bold text-dark flex items-center gap-2">
                  <MapPin size={16} className="text-primary" /> {cita?.clinica || 'Clínica no especificada'}
                </p>
                <p className="text-xs text-slate-500 pl-6 leading-relaxed">
                  {cita?.ubicacion || 'Dirección no disponible'}
                </p>
                <button className="text-xs font-black text-primary pl-6 flex items-center gap-1 hover:underline cursor-pointer">
                  <Map size={14} /> Ver en Google Maps
                </button>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <AlertTriangle size={16} />
                <span className="text-[10px] font-black uppercase tracking-wider">Recomendaciones</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                {cita.notas || "No hay indicaciones especiales para esta cita."}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER: Acciones Finales */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer">
            <Download size={18} /> Descargar Recordatorio
          </button>
          
          {/* Solo mostramos el botón si cumple las reglas (no es del pasado y no está cancelada/atendida) */}
          {esCancelable && (
            <button 
              onClick={() => onCancelar(cita.id)} // <--- AQUÍ conectamos la acción
              className="flex-1 bg-red-50 text-red-600 border border-red-100 py-3.5 rounded-2xl font-black text-sm hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer flex justify-center items-center gap-2"
            >
              <X size={18} /> Cancelar Cita
            </button>
          )}
          
          <button 
            onClick={onClose}
            className="flex-1 bg-primary text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:bg-secondary transition-all cursor-pointer"
          >
            Aceptar
          </button>
          
        </div>
      </div>
    </div>
  );
};