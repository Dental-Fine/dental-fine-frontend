import { useNavigate } from 'react-router-dom';
import { Hammer, ArrowLeft, Sparkles } from 'lucide-react';

export default function Pagos() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-in zoom-in-95 duration-700 font-sans">
      {/* Icono de Construcción animado */}
      <div className="relative w-28 h-28 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-600 mb-8 shadow-inner border border-indigo-100 group">
        <Hammer size={52} className="group-hover:-rotate-12 transition-transform duration-300" />
        <Sparkles size={24} className="absolute -top-3 -right-3 text-amber-400 animate-pulse" />
      </div>
      
      {/* Mensaje */}
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
        Módulo en Construcción
      </h1>
      <p className="text-slate-500 text-lg max-w-md mx-auto mb-10 leading-relaxed">
        Estamos preparando el apartado de <span className="font-bold text-slate-700">Caja y Pagos</span> para ofrecerte el mejor control financiero. ¡Estará listo en la siguiente fase!
      </p>
      
      {/* Botón de regreso */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
      >
        <ArrowLeft size={20} /> Volver a Recepción
      </button>
    </div>
  );
}