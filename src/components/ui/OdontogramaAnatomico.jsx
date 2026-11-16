import React, { useState } from 'react';
import { Info, X, Sparkles, CheckCircle2 } from 'lucide-react';

// Nomenclatura anatómica dental en español para todos los dientes (Sistema FDI)
export const DICCIONARIO_DIENTES = {
  // Cuadrante 1: Superior Derecho (Maxilar)
  18: { nombre: '3° Molar', nombreCompleto: 'Tercer Molar (Muela del Juicio)', arcada: 'Maxilar', cuadrante: 'Superior Derecha', tipo: 'Molar' },
  17: { nombre: '2° Molar', nombreCompleto: 'Segundo Molar Superior', arcada: 'Maxilar', cuadrante: 'Superior Derecha', tipo: 'Molar' },
  16: { nombre: '1° Molar', nombreCompleto: 'Primer Molar Superior', arcada: 'Maxilar', cuadrante: 'Superior Derecha', tipo: 'Molar' },
  15: { nombre: '2° Premolar', nombreCompleto: 'Segundo Premolar Superior', arcada: 'Maxilar', cuadrante: 'Superior Derecha', tipo: 'Premolar' },
  14: { nombre: '1° Premolar', nombreCompleto: 'Primer Premolar Superior', arcada: 'Maxilar', cuadrante: 'Superior Derecha', tipo: 'Premolar' },
  13: { nombre: 'Canino', nombreCompleto: 'Canino Superior', arcada: 'Maxilar', cuadrante: 'Superior Derecha', tipo: 'Canino' },
  12: { nombre: 'Inc. Lateral', nombreCompleto: 'Incisivo Lateral Superior', arcada: 'Maxilar', cuadrante: 'Superior Derecha', tipo: 'Incisivo' },
  11: { nombre: 'Inc. Central', nombreCompleto: 'Incisivo Central Superior', arcada: 'Maxilar', cuadrante: 'Superior Derecha', tipo: 'Incisivo' },

  // Cuadrante 2: Superior Izquierdo (Maxilar)
  21: { nombre: 'Inc. Central', nombreCompleto: 'Incisivo Central Superior', arcada: 'Maxilar', cuadrante: 'Superior Izquierda', tipo: 'Incisivo' },
  22: { nombre: 'Inc. Lateral', nombreCompleto: 'Incisivo Lateral Superior', arcada: 'Maxilar', cuadrante: 'Superior Izquierda', tipo: 'Incisivo' },
  23: { nombre: 'Canino', nombreCompleto: 'Canino Superior', arcada: 'Maxilar', cuadrante: 'Superior Izquierda', tipo: 'Canino' },
  24: { nombre: '1° Premolar', nombreCompleto: 'Primer Premolar Superior', arcada: 'Maxilar', cuadrante: 'Superior Izquierda', tipo: 'Premolar' },
  25: { nombre: '2° Premolar', nombreCompleto: 'Segundo Premolar Superior', arcada: 'Maxilar', cuadrante: 'Superior Izquierda', tipo: 'Premolar' },
  26: { nombre: '1° Molar', nombreCompleto: 'Primer Molar Superior', arcada: 'Maxilar', cuadrante: 'Superior Izquierda', tipo: 'Molar' },
  27: { nombre: '2° Molar', nombreCompleto: 'Segundo Molar Superior', arcada: 'Maxilar', cuadrante: 'Superior Izquierda', tipo: 'Molar' },
  28: { nombre: '3° Molar', nombreCompleto: 'Tercer Molar (Muela del Juicio)', arcada: 'Maxilar', cuadrante: 'Superior Izquierda', tipo: 'Molar' },

  // Cuadrante 4: Inferior Derecho (Mandíbula)
  48: { nombre: '3° Molar', nombreCompleto: 'Tercer Molar (Muela del Juicio)', arcada: 'Mandíbula', cuadrante: 'Inferior Derecha', tipo: 'Molar' },
  47: { nombre: '2° Molar', nombreCompleto: 'Segundo Molar Inferior', arcada: 'Mandíbula', cuadrante: 'Inferior Derecha', tipo: 'Molar' },
  46: { nombre: '1° Molar', nombreCompleto: 'Primer Molar Inferior', arcada: 'Mandíbula', cuadrante: 'Inferior Derecha', tipo: 'Molar' },
  45: { nombre: '2° Premolar', nombreCompleto: 'Segundo Premolar Inferior', arcada: 'Mandíbula', cuadrante: 'Inferior Derecha', tipo: 'Premolar' },
  44: { nombre: '1° Premolar', nombreCompleto: 'Primer Premolar Inferior', arcada: 'Mandíbula', cuadrante: 'Inferior Derecha', tipo: 'Premolar' },
  43: { nombre: 'Canino', nombreCompleto: 'Canino Inferior', arcada: 'Mandíbula', cuadrante: 'Inferior Derecha', tipo: 'Canino' },
  42: { nombre: 'Inc. Lateral', nombreCompleto: 'Incisivo Lateral Inferior', arcada: 'Mandíbula', cuadrante: 'Inferior Derecha', tipo: 'Incisivo' },
  41: { nombre: 'Inc. Central', nombreCompleto: 'Incisivo Central Inferior', arcada: 'Mandíbula', cuadrante: 'Inferior Derecha', tipo: 'Incisivo' },

  // Cuadrante 3: Inferior Izquierdo (Mandíbula)
  31: { nombre: 'Inc. Central', nombreCompleto: 'Incisivo Central Inferior', arcada: 'Mandíbula', cuadrante: 'Inferior Izquierda', tipo: 'Incisivo' },
  32: { nombre: 'Inc. Lateral', nombreCompleto: 'Incisivo Lateral Inferior', arcada: 'Mandíbula', cuadrante: 'Inferior Izquierda', tipo: 'Incisivo' },
  33: { nombre: 'Canino', nombreCompleto: 'Canino Inferior', arcada: 'Mandíbula', cuadrante: 'Inferior Izquierda', tipo: 'Canino' },
  34: { nombre: '1° Premolar', nombreCompleto: 'Primer Premolar Inferior', arcada: 'Mandíbula', cuadrante: 'Inferior Izquierda', tipo: 'Premolar' },
  35: { nombre: '2° Premolar', nombreCompleto: 'Segundo Premolar Inferior', arcada: 'Mandíbula', cuadrante: 'Inferior Izquierda', tipo: 'Premolar' },
  36: { nombre: '1° Molar', nombreCompleto: 'Primer Molar Inferior', arcada: 'Mandíbula', cuadrante: 'Inferior Izquierda', tipo: 'Molar' },
  37: { nombre: '2° Molar', nombreCompleto: 'Segundo Molar Inferior', arcada: 'Mandíbula', cuadrante: 'Inferior Izquierda', tipo: 'Molar' },
  38: { nombre: '3° Molar', nombreCompleto: 'Tercer Molar (Muela del Juicio)', arcada: 'Mandíbula', cuadrante: 'Inferior Izquierda', tipo: 'Molar' }
};

// Desplazamientos en píxeles para generar la curvatura natural de la arcada (parábola)
const CURVATURA_MAXILAR = {
  18: 30, 17: 20, 16: 12, 15: 6, 14: 2, 13: 0, 12: -2, 11: -3,
  21: -3, 22: -2, 23: 0, 24: 2, 25: 6, 26: 12, 27: 20, 28: 30
};

const CURVATURA_MANDIBULA = {
  48: -30, 47: -20, 46: -12, 45: -6, 44: -2, 43: 0, 42: 2, 41: 3,
  31: 3, 32: 2, 33: 0, 34: -2, 35: -6, 36: -12, 37: -20, 38: -30
};

// Componente para un Diente Individual con 5 Caras
function DienteAnatomicoItem({ numero, condiciones = {}, modoCurvo = true, onSelect }) {
  const info = DICCIONARIO_DIENTES[numero] || { nombre: `Pieza ${numero}`, nombreCompleto: `Diente ${numero}` };
  const offset = modoCurvo ? ((CURVATURA_MAXILAR[numero] !== undefined) ? CURVATURA_MAXILAR[numero] : CURVATURA_MANDIBULA[numero] || 0) : 0;

  const caras = [
    { id: 'arriba', label: 'Vestibular', clip: 'polygon(0% 0%, 100% 0%, 75% 25%, 25% 25%)' },
    { id: 'derecha', label: 'Distal', clip: 'polygon(100% 0%, 100% 100%, 75% 75%, 75% 25%)' },
    { id: 'abajo', label: 'Lingual/Palatino', clip: 'polygon(25% 75%, 75% 75%, 100% 100%, 0% 100%)' },
    { id: 'izquierda', label: 'Mesial', clip: 'polygon(0% 0%, 25% 25%, 25% 75%, 0% 100%)' },
    { id: 'centro', label: 'Oclusal', clip: 'polygon(25% 25%, 75% 25%, 75% 75%, 25% 75%)' }
  ];

  const condicionesDiente = condiciones[numero] || condiciones[String(numero)] || {};

  const obtenerColorCara = (estado) => {
    if (estado === 'caries') return 'bg-red-500 border-red-600';
    if (estado === 'resin' || estado === 'resina') return 'bg-blue-500 border-blue-600';
    if (estado === 'endodoncia') return 'bg-purple-500 border-purple-600';
    if (estado === 'ausente') return 'bg-slate-400 border-slate-500';
    return 'bg-white hover:bg-slate-50';
  };

  return (
    <div 
      style={{ transform: `translateY(${offset}px)` }}
      onClick={() => onSelect && onSelect(numero, info, condicionesDiente)}
      className="flex flex-col items-center group cursor-pointer p-1 rounded-xl transition-all duration-200 hover:scale-105 hover:bg-slate-50 relative"
      title={`${info.nombreCompleto} (Pieza ${numero})`}
    >
      {/* Nombre anatómico del diente en lugar del número */}
      <span className="text-[10px] font-black text-slate-700 text-center leading-tight max-w-[56px] truncate group-hover:text-primary transition-colors">
        {info.nombre}
      </span>

      {/* Esquema Anatómico de 5 caras */}
      <div className="relative w-11 h-11 my-1 border-2 border-slate-300 bg-slate-200 rounded-md overflow-hidden shadow-xs group-hover:border-primary/50 transition-colors">
        {caras.map((cara) => {
          const estado = condicionesDiente[cara.id];
          return (
            <div
              key={cara.id}
              style={{ clipPath: cara.clip }}
              className={`absolute inset-0 border border-slate-300/40 transition-colors duration-150 ${obtenerColorCara(estado)}`}
            />
          );
        })}
      </div>

      {/* Insignia pequeña con número FDI (referencia secundaria) */}
      <span className="text-[9px] font-bold text-slate-400 font-mono px-1 rounded bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary">
        #{numero}
      </span>
    </div>
  );
}

export const OdontogramaAnatomico = ({ odontogramaData = {}, soloLectura = true }) => {
  const [dienteModal, setDienteModal] = useState(null);
  const [modoCurvo, setModoCurvo] = useState(true);

  // Cuadrantes anatómicos
  const c1 = [18, 17, 16, 15, 14, 13, 12, 11]; // Superior Derecha
  const c2 = [21, 22, 23, 24, 25, 26, 27, 28]; // Superior Izquierda
  const c4 = [48, 47, 46, 45, 44, 43, 42, 41]; // Inferior Derecha
  const c3 = [31, 32, 33, 34, 35, 36, 37, 38]; // Inferior Izquierda

  const handleSelectDiente = (numero, info, condiciones) => {
    setDienteModal({ numero, info, condiciones });
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
      
      {/* Barra Superior con Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            Odontograma Anatómico
          </h3>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Piezas dentales identificadas por sus nombres anatómicos y distribución por arcadas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModoCurvo(!modoCurvo)}
          className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {modoCurvo ? 'Vista: Arcada Anatómica (Curva)' : 'Vista: Cuadrantes Alineados'}
        </button>
      </div>

      {/* Contenedor con Scroll Horizontal si es necesario */}
      <div className="overflow-x-auto pb-6">
        <div className="min-w-[760px] max-w-4xl mx-auto flex flex-col items-center select-none">
          
          {/* ======================= MAXILAR (ARCADA SUPERIOR) ======================= */}
          <div className="w-full text-center mb-2">
            <span className="inline-block px-4 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black tracking-widest uppercase shadow-xs">
              Maxilar
            </span>
          </div>

          <div className="w-full grid grid-cols-2 text-xs font-black text-slate-600 px-4 mb-3">
            <div className="text-left pl-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
              superior derecha
            </div>
            <div className="text-right pr-2 flex items-center justify-end gap-1.5">
              superior izquierda
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
            </div>
          </div>

          {/* Dientes del Maxilar */}
          <div className={`flex justify-center items-center gap-4 ${modoCurvo ? 'pt-8 pb-10' : 'py-4'}`}>
            {/* Cuadrante 1: Superior Derecho */}
            <div className="flex gap-1.5 justify-end">
              {c1.map(num => (
                <DienteAnatomicoItem
                  key={num}
                  numero={num}
                  condiciones={odontogramaData}
                  modoCurvo={modoCurvo}
                  onSelect={handleSelectDiente}
                />
              ))}
            </div>

            {/* Separador Central (Línea Media) */}
            <div className="h-20 w-[2px] bg-slate-300 self-center rounded-full opacity-60 mx-1" title="Línea Media Dental" />

            {/* Cuadrante 2: Superior Izquierdo */}
            <div className="flex gap-1.5 justify-start">
              {c2.map(num => (
                <DienteAnatomicoItem
                  key={num}
                  numero={num}
                  condiciones={odontogramaData}
                  modoCurvo={modoCurvo}
                  onSelect={handleSelectDiente}
                />
              ))}
            </div>
          </div>

          {/* ======================= CRUZ DIVISORIA CENTRAL ======================= */}
          <div className="w-full my-4 relative flex items-center justify-center">
            <div className="w-full border-t-2 border-dashed border-slate-300"></div>
            <span className="absolute bg-white px-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Plano de Oclusión Dental
            </span>
          </div>

          {/* ======================= MANDÍBULA (ARCADA INFERIOR) ======================= */}
          <div className="w-full grid grid-cols-2 text-xs font-black text-slate-600 px-4 mt-2 mb-2">
            <div className="text-left pl-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block"></span>
              Inferior derecha
            </div>
            <div className="text-right pr-2 flex items-center justify-end gap-1.5">
              Inferior izquierda
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block"></span>
            </div>
          </div>

          {/* Dientes de la Mandíbula */}
          <div className={`flex justify-center items-center gap-4 ${modoCurvo ? 'pt-10 pb-8' : 'py-4'}`}>
            {/* Cuadrante 4: Inferior Derecho */}
            <div className="flex gap-1.5 justify-end">
              {c4.map(num => (
                <DienteAnatomicoItem
                  key={num}
                  numero={num}
                  condiciones={odontogramaData}
                  modoCurvo={modoCurvo}
                  onSelect={handleSelectDiente}
                />
              ))}
            </div>

            {/* Separador Central (Línea Media) */}
            <div className="h-20 w-[2px] bg-slate-300 self-center rounded-full opacity-60 mx-1" title="Línea Media Dental" />

            {/* Cuadrante 3: Inferior Izquierdo */}
            <div className="flex gap-1.5 justify-start">
              {c3.map(num => (
                <DienteAnatomicoItem
                  key={num}
                  numero={num}
                  condiciones={odontogramaData}
                  modoCurvo={modoCurvo}
                  onSelect={handleSelectDiente}
                />
              ))}
            </div>
          </div>

          <div className="w-full text-center mt-3">
            <span className="inline-block px-4 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-black tracking-widest uppercase shadow-xs">
              Mandíbula
            </span>
          </div>

        </div>
      </div>

      {/* Leyenda Clínica */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-white border border-slate-300 shadow-xs" />
          <span>Sano / Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-red-500 border border-red-600 shadow-xs" />
          <span>Caries Activa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-blue-500 border border-blue-600 shadow-xs" />
          <span>Restaurado (Resina)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-purple-500 border border-purple-600 shadow-xs" />
          <span>Endodoncia</span>
        </div>
      </div>

      {/* MODAL / DETALLE DE PIEZA DENTAL */}
      {dienteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[28px] shadow-2xl p-6 border border-slate-100 animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                  {dienteModal.info.arcada} • {dienteModal.info.cuadrante}
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-0.5">
                  {dienteModal.info.nombreCompleto}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Pieza dental FDI: <span className="font-bold text-slate-700">#{dienteModal.numero}</span> ({dienteModal.info.tipo})
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setDienteModal(null)}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors cursor-pointer text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 my-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado de las 5 caras:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['Vestibular', 'Oclusal', 'Lingual/Palatino', 'Mesial', 'Distal'].map((caraName) => {
                  const keyMap = {
                    'Vestibular': 'arriba',
                    'Oclusal': 'centro',
                    'Lingual/Palatino': 'abajo',
                    'Mesial': 'izquierda',
                    'Distal': 'derecha'
                  };
                  const estado = dienteModal.condiciones[keyMap[caraName]] || 'Sano';
                  const badgeColor = estado === 'caries' ? 'bg-red-100 text-red-700 border-red-200' 
                    : (estado === 'resin' || estado === 'resina') ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <div key={caraName} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between">
                      <span className="font-medium text-slate-500 text-[11px]">{caraName}</span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 mt-1 rounded border w-fit capitalize ${badgeColor}`}>
                        {estado}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDienteModal(null)}
              className="w-full mt-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default OdontogramaAnatomico;
