import React from 'react';
import { Calendar, Clock, User, Stethoscope, AlertCircle } from 'lucide-react';

export const CitaCard = ({ cita, onVerDetalles }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group overflow-hidden flex flex-col">
      
      {/* Parte superior de la Card */}
      <div className="p-6 space-y-4 flex-1">
        <div className="flex justify-between items-start">
          <div className="bg-primary/5 text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
            <Stethoscope size={24} />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
            <div className={`w-2 h-2 rounded-full ${cita.estado === 'Pendiente' ? 'bg-amber-500' : 'bg-green-500'}`}></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{cita.estado}</span>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-black text-dark leading-tight">{cita.servicio}</h4>
          <p className="text-slate-500 font-bold text-sm mt-1 flex items-center gap-2">
            <User size={14} className="text-primary" /> {cita.doctor}
          </p>
        </div>

        <div className="pt-4 space-y-2.5 border-t border-slate-50">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Calendar size={16} />
            </div>
            <span className="font-bold text-slate-700">{cita.fecha}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Clock size={16} />
            </div>
            <span className="font-bold text-slate-700">{cita.hora} hrs</span>
          </div>
        </div>

        {cita.notas && (
          <div className="bg-amber-50 p-3 rounded-xl flex gap-2 items-start mt-4 border border-amber-100">
            <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">{cita.notas}</p>
          </div>
        )}
      </div>

      {/* Acciones de la Card */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
        <button 
          onClick={onVerDetalles}
          className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Ver Detalles
        </button>
        {cita.estado === 'Pendiente' && (
          <button className="flex-1 py-2.5 bg-white border border-red-100 text-red-500 rounded-xl text-xs font-black hover:bg-red-50 transition-colors cursor-pointer">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};