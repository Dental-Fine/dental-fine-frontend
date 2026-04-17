import React, { useState } from 'react';
import { Diente } from './Diente';
import { X, Save, Info } from 'lucide-react';

// Le agregamos la propiedad "soloLectura". Por defecto es true para el paciente.
export const Odontograma = ({ soloLectura = true }) => {
  const cuadrante1 = [18, 17, 16, 15, 14, 13, 12, 11]; 
  const cuadrante2 = [21, 22, 23, 24, 25, 26, 27, 28]; 
  const cuadrante4 = [48, 47, 46, 45, 44, 43, 42, 41]; 
  const cuadrante3 = [31, 32, 33, 34, 35, 36, 37, 38]; 

  // Mocks: Simulamos que el paciente ya tiene historial en la BD
  const inicializarDientes = () => {
    const todosLosDientes = [...cuadrante1, ...cuadrante2, ...cuadrante3, ...cuadrante4];
    const estadoInicial = {};
    todosLosDientes.forEach(num => {
      estadoInicial[num] = { estado: 'Sano', notas: '' };
    });
    
    // Agregamos historial de prueba
    estadoInicial[16] = { estado: 'Restaurado', notas: 'Resina colocada hace 2 años.' };
    estadoInicial[21] = { estado: 'Restaurado', notas: 'Carilla estética.' };
    estadoInicial[36] = { estado: 'Caries', notas: 'Caries profunda, requiere atención pronta.' };
    estadoInicial[48] = { estado: 'Ausente', notas: 'Extracción de tercer molar (Muela del juicio).' };

    return estadoInicial;
  };

  const [dientes, setDientes] = useState(inicializarDientes());
  const [dienteSeleccionado, setDienteSeleccionado] = useState(null);

  const handleDienteClick = (numero) => {
    setDienteSeleccionado({
      numero,
      ...dientes[numero]
    });
  };

  const guardarCambios = () => {
    if (soloLectura) return; // Seguridad extra
    setDientes({
      ...dientes,
      [dienteSeleccionado.numero]: {
        estado: dienteSeleccionado.estado,
        notas: dienteSeleccionado.notas
      }
    });
    setDienteSeleccionado(null); 
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
      
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
        <h3 className="text-xl font-black text-dark">Odontograma Inicial</h3>
        <div className="flex gap-4 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full border border-slate-300 bg-white"></div> Sano</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Caries</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Restaurado</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[800px] flex flex-col items-center gap-6">
          <div className="flex gap-6 border-b-2 border-slate-200 pb-6 px-4">
            <div className="flex gap-1">
              {cuadrante1.map(num => (
                <Diente key={num} numero={num} estado={dientes[num].estado} onClick={handleDienteClick} />
              ))}
            </div>
            <div className="flex gap-1 border-l-2 border-slate-200 pl-6">
              {cuadrante2.map(num => (
                <Diente key={num} numero={num} estado={dientes[num].estado} onClick={handleDienteClick} />
              ))}
            </div>
          </div>

          <div className="flex gap-6 pt-2 px-4">
            <div className="flex gap-1">
              {cuadrante4.map(num => (
                <Diente key={num} numero={num} estado={dientes[num].estado} onClick={handleDienteClick} />
              ))}
            </div>
            <div className="flex gap-1 border-l-2 border-slate-200 pl-6">
              {cuadrante3.map(num => (
                <Diente key={num} numero={num} estado={dientes[num].estado} onClick={handleDienteClick} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL (Adaptado para Solo Lectura) */}
      {dienteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-black text-dark flex items-center gap-2">
                <Info className="text-primary" size={20} />
                Detalle Diente {dienteSeleccionado.numero}
              </h4>
              <button onClick={() => setDienteSeleccionado(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Diagnóstico Actual</label>
                <select 
                  value={dienteSeleccionado.estado}
                  onChange={(e) => setDienteSeleccionado({...dienteSeleccionado, estado: e.target.value})}
                  disabled={soloLectura} // <--- Bloqueado si es paciente
                  className={`w-full p-3 rounded-xl font-bold text-dark outline-none transition-all ${soloLectura ? 'bg-slate-100 border-transparent cursor-not-allowed opacity-90' : 'bg-slate-50 border border-slate-200 focus:border-primary'}`}
                >
                  <option value="Sano">Sano</option>
                  <option value="Caries">Caries</option>
                  <option value="Restaurado">Restaurado / Resina</option>
                  <option value="Ausente">Ausente / Extraído</option>
                  <option value="Endodoncia">Endodoncia</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Observaciones Clínicas</label>
                <textarea 
                  value={dienteSeleccionado.notas}
                  onChange={(e) => setDienteSeleccionado({...dienteSeleccionado, notas: e.target.value})}
                  disabled={soloLectura} // <--- Bloqueado si es paciente
                  placeholder={soloLectura ? "Sin observaciones." : "Ej. Caries profunda en cara oclusal..."}
                  className={`w-full p-3 rounded-xl font-medium text-sm outline-none h-24 resize-none transition-all ${soloLectura ? 'bg-slate-100 border-transparent cursor-not-allowed opacity-90 text-slate-600' : 'bg-slate-50 border border-slate-200 focus:border-primary'}`}
                ></textarea>
              </div>

              {/* El botón de guardar SOLO aparece si NO es de solo lectura */}
              {!soloLectura && (
                <button 
                  onClick={guardarCambios}
                  className="w-full mt-2 bg-primary text-white py-3 rounded-xl font-black flex justify-center items-center gap-2 hover:bg-secondary transition-colors cursor-pointer"
                >
                  <Save size={18} /> Guardar Diagnóstico
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};