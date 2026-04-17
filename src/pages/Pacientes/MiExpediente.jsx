import React from 'react';
import { Odontograma } from '../../components/ui/Odontograma';

import { 
  Activity, AlertTriangle, Pill, HeartPulse, 
  FileText, Clock, ShieldAlert, Droplet, 
  Stethoscope, ChevronRight 
} from 'lucide-react';

export const MiExpediente = () => {
  // Mocks basados en tu tabla 'AntecedentesMedicos'
  const antecedentes = {
    alergias: "Penicilina, Látex",
    medicamentosActuales: "Losartán 50mg, Ibuprofeno (ocasional)",
    habitosSalud: "Fumador social (1-2 a la semana), Consumo regular de café.",
    historialDental: "Tratamiento de ortodoncia finalizado en 2021. Extracción de 4 terceros molares (muelas del juicio).",
    motivoInicial: "Sensibilidad en molares inferiores al tomar bebidas frías.",
    ultimaActualizacion: "10 de Abril, 2026",
    doctorActualizo: "Dr. Iván Ramos"
  };

  // Mocks de tratamientos en curso (Tabla TratamientosPacientes)
  const tratamientosActivos = [
    { id: 1, nombre: "Limpieza Profunda y Profilaxis", progreso: 100, estado: "Completado" },
    { id: 2, nombre: "Resina Estética Diente 36", progreso: 50, estado: "En curso" }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider mb-3">
            <Activity size={14} /> Historial Clínico
          </div>
          <h2 className="text-3xl font-black text-dark tracking-tight">Mi Expediente</h2>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <Clock size={16} /> Última actualización: {antecedentes.ultimaActualizacion}
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary transition-colors cursor-pointer bg-slate-50 px-4 py-2 rounded-xl">
          <FileText size={16} /> Descargar PDF Completo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Alertas y Medicamentos (Lo más crítico) */}
        <div className="space-y-6">
          
          {/* Tarjeta de Alergias (Color Rojo Semántico) */}
          <div className="bg-red-50 rounded-3xl border border-red-100 p-6 shadow-sm relative overflow-hidden">
            <ShieldAlert size={100} className="absolute -right-6 -bottom-6 text-red-100/50" />
            <div className="relative z-10">
              <h3 className="text-red-800 font-black flex items-center gap-2 mb-4">
                <AlertTriangle size={20} /> Alergias y Contraindicaciones
              </h3>
              {antecedentes.alergias ? (
                <p className="text-red-900 font-medium text-lg leading-tight">
                  {antecedentes.alergias}
                </p>
              ) : (
                <p className="text-red-700/70 text-sm">Sin alergias registradas.</p>
              )}
            </div>
          </div>

          {/* Tarjeta de Medicamentos */}
          <div className="bg-blue-50 rounded-3xl border border-blue-100 p-6 shadow-sm">
            <h3 className="text-blue-800 font-black flex items-center gap-2 mb-4">
              <Pill size={20} /> Medicación Actual
            </h3>
            <p className="text-blue-900 font-medium leading-relaxed">
              {antecedentes.medicamentosActuales}
            </p>
          </div>

          {/* Tarjeta de Hábitos */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-slate-800 font-black flex items-center gap-2 mb-4">
              <HeartPulse size={20} className="text-rose-500" /> Hábitos de Salud
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              {antecedentes.habitosSalud}
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA: Historia Dental y Tratamientos */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tarjeta de Historial Dental Previo */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-black text-dark mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
              <Stethoscope className="text-primary" /> Historial Odontológico
            </h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Motivo de Consulta Inicial</p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-slate-700 font-medium text-sm leading-relaxed">
                    {antecedentes.motivoInicial}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tratamientos Previos (Otras Clínicas)</p>
                <p className="text-slate-600 font-medium text-sm leading-relaxed px-2">
                  {antecedentes.historialDental}
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta de Tratamientos Activos */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-dark">Plan de Tratamiento Actual</h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Dr. a cargo: {antecedentes.doctorActualizo}
              </span>
            </div>

            <div className="space-y-4">
              {tratamientosActivos.map((trat) => (
                <div key={trat.id} className="group p-4 border border-slate-100 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-800">{trat.nombre}</h4>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                      trat.estado === 'Completado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {trat.estado}
                    </span>
                  </div>
                  
                  {/* Barra de progreso visual */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-1 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${trat.estado === 'Completado' ? 'bg-green-500' : 'bg-primary'}`} 
                      style={{ width: `${trat.progreso}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-[10px] font-bold text-slate-400">{trat.progreso}% completado</p>
                </div>
              ))}
            </div>
            
            {/* EL NUEVO ODONTOGRAMA */}
            <div className="mt-8">
               <Odontograma />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};