import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Calendar, Award, CheckCircle2, FlaskConical, MapPin, Stethoscope, ClipboardList } from 'lucide-react';

// --- COMPONENTE AYUDANTE: DienteEsquemático (Visualización Premium) ---
// Ajustamos el tamaño por defecto a w-9 h-11 para que quepan mejor en la pantalla
function DienteEsquemático({ numero, condiciones, tamaño = "w-9 h-11 lg:w-10 lg:h-12" }) {
  const obtenerEstiloCara = (condicion) => {
    if (condicion === 'caries') return 'bg-red-100 border-2 border-red-400 hover:bg-red-200';
    if (condicion === 'resin') return 'bg-blue-100 border-2 border-blue-400 hover:bg-blue-200';
    return 'bg-white border-2 border-slate-200 hover:bg-slate-100'; // Sano
  };

  const caras = [
    { id: 'arriba', label: 'Vestibular/Palatina', clip: 'polygon(0 0, 100% 0, 80% 30%, 20% 30%)' }, 
    { id: 'abajo', label: 'Lingual', clip: 'polygon(20% 70%, 80% 70%, 100% 100%, 0 100%)' }, 
    { id: 'izquierda', label: 'Mesial/Distal Izq', clip: 'polygon(0 0, 20% 30%, 20% 70%, 0 100%)' }, 
    { id: 'derecha', label: 'Distal/Mesial Der', clip: 'polygon(100% 0, 100% 100%, 80% 70%, 80% 30%)' }, 
    { id: 'centro', label: 'Oclusal/Incisal', clip: 'polygon(20% 30%, 80% 30%, 80% 70%, 20% 70%)' }, 
  ];

  return (
    <div className="flex flex-col items-center gap-1 group shrink-0">
      <div className={`${tamaño} relative bg-white border border-slate-300 shadow-inner rounded-sm overflow-hidden transition-all`}>
        {caras.map((cara) => (
          <div
            key={cara.id}
            style={{ clipPath: cara.clip }}
            title={`${numero} - ${cara.label}`}
            className={`absolute inset-0 transition-colors cursor-pointer ${obtenerEstiloCara(condiciones?.[cara.id])}`}
          />
        ))}
      </div>
      <span className="text-[10px] lg:text-[11px] text-slate-500 font-bold group-hover:text-indigo-600 transition-colors">
        {numero}
      </span>
    </div>
  );
}

export default function ExpedienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const paciente = {
    id: id || 101,
    nombre: 'Valeria García',
    fechaNac: '12 May 2002',
    tipoSangre: 'O+',
    alertas: ['Alergia Penicilina', 'Sensibilidad dental'],
  };

  const mapaDental = {
    17: { derecha: 'caries', centro: 'resin' },
    16: { centro: 'caries' },
    11: { izquierda: 'resin' },
    21: { centro: 'resin' },
    22: { centro: 'caries', arriba: 'caries' },
    24: { centro: 'caries' },
    31: { arriba: 'resin' },
    34: { abajo: 'resin' },
    36: { centro: 'caries' },
    37: { centro: 'resin' },
    41: { centro: 'caries' },
    46: { centro: 'caries', abajo: 'resin' },
  };

  const historialTratamientos = [
    { fecha: '16 Abr 2026', accion: 'Limpieza Profunda', dr: 'Dr. López', icono: Award, color: 'text-emerald-500' },
    { fecha: '02 Mar 2026', accion: 'Resina Oclusal Diente 17', dr: 'Dr. López', icono: FlaskConical, color: 'text-indigo-500' },
    { fecha: '15 Feb 2026', accion: 'Extracción Molar 48 (Juicio)', dr: 'Dra. Martínez', icono: MapPin, color: 'text-red-500' },
  ];

  const filaSuperior = [
    ...Array.from({ length: 8 }, (_, i) => 18 - i), 
    ...Array.from({ length: 8 }, (_, i) => 21 + i), 
  ];
  const filaInferior = [
    ...Array.from({ length: 8 }, (_, i) => 48 - i), 
    ...Array.from({ length: 8 }, (_, i) => 31 + i), 
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-700 font-sans">
      <button onClick={() => navigate('/dashboard/expedientes')}
        className="flex items-center gap-2.5 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm">
        <ArrowLeft size={18} /> Volver a expedientes
      </button>

      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 text-center md:text-left">
          <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex shrink-0 items-center justify-center text-white text-5xl font-extrabold shadow-lg shadow-indigo-600/20">
            {paciente.nombre.split(' ').map(n=>n[0]).join('')}
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Expediente ID: #{paciente.id}</span>
            <h1 className="text-4xl font-extrabold text-slate-950 tracking-tighter mt-1.5">{paciente.nombre}</h1>
            <p className="text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-2"><Calendar size={15}/> Nacimiento: {paciente.fechaNac} ({paciente.tipoSangre})</p>
          </div>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white w-full md:w-auto px-7 py-3.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 text-sm flex items-center justify-center gap-2.5">
          <ClipboardList size={18} /> Nueva Nota Médica
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: ODONTOGRAMA PREMIUM */}
        <div className="lg:col-span-8 bg-white p-6 lg:p-10 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-4">
            <h2 className="text-2xl font-extrabold text-slate-950 flex items-center gap-3 tracking-tight">
              <Stethoscope className="text-indigo-600 shrink-0" size={28}/> Mapa Dental
            </h2>
            <div className="flex gap-4 border border-slate-100 bg-slate-50/50 p-3 rounded-2xl text-xs font-semibold">
              <div className="flex items-center gap-2 text-red-700"><span className="w-3.5 h-3.5 bg-red-100 border-2 border-red-400 rounded-sm"></span> Caries</div>
              <div className="flex items-center gap-2 text-blue-700"><span className="w-3.5 h-3.5 bg-blue-100 border-2 border-blue-400 rounded-sm"></span> Resina</div>
            </div>
          </div>

          {/* ESTRUCTURA DEL ODONTOGRAMA CON SCROLL HORIZONTAL */}
          <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[650px] space-y-8 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
              
              {/* FILA SUPERIOR */}
              <div className="flex justify-center gap-x-1.5 lg:gap-x-2 relative border-b-2 border-slate-200 border-dashed pb-6">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 opacity-50 z-0 -translate-x-1/2"></div>
                {filaSuperior.map((num) => (
                  <DienteEsquemático key={num} numero={num} condiciones={mapaDental[num]} />
                ))}
              </div>

              {/* FILA INFERIOR */}
              <div className="flex justify-center gap-x-1.5 lg:gap-x-2 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 opacity-50 z-0 -translate-x-1/2"></div>
                {filaInferior.map((num) => (
                  <DienteEsquemático key={num} numero={num} condiciones={mapaDental[num]} />
                ))}
              </div>

            </div>
          </div>
          <p className="text-xs text-slate-400 mt-6 italic text-center">Selecciona una cara específica de un diente para registrar un hallazgo clínico.</p>
        </div>

        {/* COLUMNA DERECHA: ALERTAS E HISTORIAL */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-red-600 p-8 rounded-[40px] text-white shadow-xl shadow-red-600/20">
            <h4 className="font-bold text-xl mb-5 flex items-center gap-2.5 italic tracking-tight"><Activity size={22} /> Alertas Críticas</h4>
            <ul className="text-sm space-y-3 font-semibold">
              {paciente.alertas.map(a=>(<li key={a} className="flex items-center gap-3"><CheckCircle2 size={16} className="text-red-200"/> {a}</li>))}
            </ul>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">Tratamientos Realizados</h3>
            <div className="space-y-8">
              {historialTratamientos.map((item, index) => {
                const IconoTratamiento = item.icono;
                return (
                  <div key={index} className="flex gap-5 relative">
                    {index !== historialTratamientos.length - 1 && <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-100" />}
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 shrink-0 z-10 border border-slate-200">
                      <IconoTratamiento size={22} />
                    </div>
                    <div className="pb-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.fecha}</p>
                      <h4 className="font-bold text-slate-950 mt-0.5 text-base">{item.accion}</h4>
                      <p className="text-[11px] text-indigo-600 font-bold mt-1.5 flex items-center gap-1.5"><MapPin size={12}/> Atendido por: {item.dr}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}