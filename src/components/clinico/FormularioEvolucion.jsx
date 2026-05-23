import React, { useState } from 'react';
import { api } from '../../services/api';
import { Save, AlertCircle, CalendarClock, PenLine } from 'lucide-react';

export const FormularioEvolucion = ({ pacienteId }) => {
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [notas, setNotas] = useState('');
  const [citaId, setCitaId] = useState('');

  const guardarEvolucion = async (e) => {
    e.preventDefault();
    if (!notas.trim() || !citaId) return;

    setGuardando(true);
    setMensaje(null);
    try {
      await api.post(`/expedientes/${pacienteId}/evolucion`, {
        citaId: parseInt(citaId),
        notasClinicas: notas
      });
      setMensaje({ tipo: 'exito', texto: 'Nota de evolución guardada correctamente en el expediente.' });
      setNotas('');
      setCitaId('');
    } catch (error) {
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error de red: El backend no está activo o la base de datos no tiene las tablas.' 
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      <div className="mb-8 pb-4 border-b border-[#E5E5EA]">
        <h2 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Evolución de Tratamiento</h2>
        <p className="text-[#86868B] font-medium mt-1">Registra los procedimientos realizados en la cita actual.</p>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 border ${mensaje.tipo === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <p className="font-medium">{mensaje.texto}</p>
        </div>
      )}

      <form onSubmit={guardarEvolucion} className="space-y-6 flex-1">
        
        <div className="bg-[#F5F5F7] rounded-3xl p-6 border border-[#E5E5EA]">
          <label className="flex items-center gap-2 text-[#1D1D1F] font-semibold mb-3">
            <CalendarClock size={18} className="text-blue-500" /> ID de la Cita Asociada
          </label>
          <input 
            type="number" 
            value={citaId}
            onChange={(e) => setCitaId(e.target.value)}
            placeholder="Ej. 102"
            className="w-full bg-white border border-[#E5E5EA] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
            required
          />
          <p className="text-[#86868B] text-sm mt-2">Enlaza esta evolución médica a una cita existente en el sistema.</p>
        </div>

        <div className="bg-[#F5F5F7] rounded-3xl p-6 border border-[#E5E5EA]">
          <label className="flex items-center gap-2 text-[#1D1D1F] font-semibold mb-3">
            <PenLine size={18} className="text-blue-500" /> Notas Clínicas
          </label>
          <textarea 
            rows="8"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Describe los procedimientos realizados, anestesia usada, complicaciones, indicaciones dadas al paciente..."
            className="w-full bg-white border border-[#E5E5EA] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-none leading-relaxed"
            required
          ></textarea>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={guardando}
            className="flex items-center gap-2 bg-[#1D1D1F] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#333336] transition-colors disabled:opacity-50 text-lg"
          >
            <Save size={20} />
            {guardando ? 'Guardando...' : 'Guardar Evolución'}
          </button>
        </div>

      </form>
    </div>
  );
};
