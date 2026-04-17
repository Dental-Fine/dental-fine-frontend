import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, User, Calendar as CalendarIcon, 
  Clock, CheckCircle2, ChevronRight, ChevronLeft,
  MapPin, ShieldCheck, ArrowRight
} from 'lucide-react';

export const AgendarCita = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState({
    servicio: '',
    dentista: '',
    fecha: '',
    hora: ''
  });

  const servicios = ["Limpieza General", "Extracción", "Ortodoncia", "Resina"];
  const dentistas = ["Dr. Iván Ramos", "Dra. Elena Solís", "Dr. Luis García"];
  const horasDisponibles = ["09:00", "11:00", "13:00", "16:00"];

  const siguiente = () => setPaso(paso + 1);
  const atras = () => setPaso(paso - 1);

  const finalizarCita = () => {
    // Aquí es donde llamarías a tu servicio:
    // citaService.agendar(datos)
    setPaso(5); // Ir al paso de éxito
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden transition-all duration-500">
      
      {/* Barra de Progreso (Solo visible hasta el paso 4) */}
      {paso <= 4 && (
        <div className="bg-primary p-8 text-white">
          <h2 className="text-2xl font-black mb-4">Nueva Cita</h2>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${paso >= num ? 'bg-white text-primary' : 'bg-white/20 text-white/60'}`}>
                  {num}
                </div>
                {num < 4 && <div className={`w-8 h-1 transition-all ${paso > num ? 'bg-white' : 'bg-white/20'}`}></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-10">
        {/* PASOS 1, 2 Y 3 (Se mantienen igual...) */}
        {paso === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-black text-dark mb-6 flex items-center gap-2">
              <Stethoscope className="text-primary" /> ¿Qué tratamiento necesitas?
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {servicios.map((s) => (
                <button 
                  key={s}
                  onClick={() => { setDatos({...datos, servicio: s}); siguiente(); }}
                  className={`p-4 text-left border rounded-2xl font-bold transition-all flex justify-between items-center group cursor-pointer ${datos.servicio === s ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-700 hover:border-primary hover:bg-primary/5'}`}
                >
                  {s}
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {paso === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <h3 className="text-lg font-black text-dark flex items-center gap-2">
              <User className="text-primary" /> Elige tu especialista y fecha
            </h3>
            <div className="space-y-4">
              <select 
                onChange={(e) => setDatos({...datos, dentista: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-primary"
              >
                <option value="">Selecciona Dentista</option>
                {dentistas.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input 
                type="date" 
                onChange={(e) => setDatos({...datos, fecha: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-primary" 
              />
            </div>
            <div className="flex gap-3 pt-6">
              <button onClick={atras} className="flex-1 py-4 border border-slate-200 rounded-2xl font-black text-slate-500 cursor-pointer">Atrás</button>
              <button onClick={siguiente} disabled={!datos.dentista || !datos.fecha} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/30 disabled:opacity-50 cursor-pointer">Siguiente</button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <h3 className="text-lg font-black text-dark mb-6 flex items-center gap-2">
              <Clock className="text-primary" /> Horario disponible
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {horasDisponibles.map(h => (
                <button 
                  key={h} 
                  onClick={() => setDatos({...datos, hora: h})}
                  className={`p-4 border rounded-2xl font-bold transition-all ${datos.hora === h ? 'bg-primary text-white border-primary' : 'border-slate-200 text-dark hover:border-primary cursor-pointer'}`}
                >
                  {h} hrs
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-10">
              <button onClick={atras} className="flex-1 py-4 border border-slate-200 rounded-2xl font-black text-slate-500 cursor-pointer">Atrás</button>
              <button onClick={siguiente} disabled={!datos.hora} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/30 disabled:opacity-50 cursor-pointer">Revisar Cita</button>
            </div>
          </div>
        )}

        {/* PASO 4: REVIEW (NUEVO) */}
        {paso === 4 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-primary/10 text-primary rounded-full mb-2">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-black text-dark">Confirma tu selección</h3>
              <p className="text-slate-500 text-sm">Verifica que los datos sean correctos antes de agendar.</p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tratamiento</p>
                  <p className="font-bold text-dark">{datos.servicio}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Especialista</p>
                  <p className="font-bold text-dark">{datos.dentista}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="text-slate-400" size={18} />
                  <span className="font-bold text-sm text-slate-700">{datos.fecha}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-slate-400" size={18} />
                  <span className="font-bold text-sm text-slate-700">{datos.hora} hrs</span>
                </div>
              </div>
            </div>

            <button 
              onClick={finalizarCita}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-green-100 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <CheckCircle2 size={20} /> Confirmar y Agendar
            </button>
            <button onClick={atras} className="w-full text-slate-400 font-bold text-sm hover:text-dark cursor-pointer">Corregir datos</button>
          </div>
        )}

        {/* PASO 5: ÉXITO (NUEVO) */}
        {paso === 5 && (
          <div className="text-center animate-in zoom-in-90 duration-700 py-10">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-3xl font-black text-dark mb-2">¡Cita Agendada!</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">Tu cita ha sido registrada exitosamente. Puedes ver los detalles en tu lista de citas.</p>
            
            <button 
              onClick={() => navigate('/paciente/citas')}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/30 flex items-center justify-center gap-2 mx-auto hover:scale-105 transition-all cursor-pointer"
            >
              Ir a Mis Citas <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};