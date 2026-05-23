import React, { useState } from 'react';
import { Odontograma } from '../ui/Odontograma';
import { Save, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const OdontogramaEditor = ({ pacienteId }) => {
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const guardarOdontograma = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      // Mock del estadoDientes que generaría el Odontograma (si fuera interactivo real)
      const mockData = {
        "11": "CARIES",
        "12": "SANO"
      };
      // Petición al backend fallido
      await api.put(`/expedientes/${pacienteId}/odontograma`, { estadoDientes: mockData });
      setMensaje({ tipo: 'exito', texto: 'Odontograma guardado correctamente.' });
    } catch (error) {
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error de red: El servidor backend no está respondiendo (ver error en consola).' 
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#E5E5EA]">
        <div>
          <h2 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Editor de Odontograma</h2>
          <p className="text-[#86868B] font-medium mt-1">Haz clic en las piezas dentales para actualizar su estado clínico.</p>
        </div>
        <button 
          onClick={guardarOdontograma}
          disabled={guardando}
          className="flex items-center gap-2 bg-[#1D1D1F] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#333336] transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 border ${mensaje.tipo === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <p className="font-medium">{mensaje.texto}</p>
        </div>
      )}

      {/* Aquí renderizamos el Odontograma Visual que ya existe en ui/Odontograma.jsx */}
      <div className="flex-1 bg-[#F5F5F7] rounded-3xl p-8 flex items-center justify-center border border-[#E5E5EA]">
        <div className="scale-90 lg:scale-100 origin-top">
           <Odontograma interactivo={true} />
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        <span className="flex items-center gap-2 text-sm font-medium text-[#86868B]"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Caries</span>
        <span className="flex items-center gap-2 text-sm font-medium text-[#86868B]"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Resina</span>
        <span className="flex items-center gap-2 text-sm font-medium text-[#86868B]"><div className="w-3 h-3 bg-gray-900 rounded-full"></div> Ausente</span>
        <span className="flex items-center gap-2 text-sm font-medium text-[#86868B]"><div className="w-3 h-3 bg-yellow-400 rounded-full"></div> Corona</span>
      </div>
    </div>
  );
};
