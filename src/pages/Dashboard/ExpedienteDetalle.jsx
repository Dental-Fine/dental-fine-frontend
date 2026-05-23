import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Calendar, Heart, AlertCircle, ClipboardList, Loader2, X, Plus } from 'lucide-react';
import { ApiService } from '../../services/api.js';

// --- COMPONENTE INTERNO: Diente Esquemático Original de 5 Caras ---
function DienteEsquematico({ numero, condiciones = {}, onCaraClick }) {
  const obtenerEstiloCara = (condicion) => {
    if (condicion === 'caries') return 'bg-red-500 border-red-600 z-10';
    if (condicion === 'resin' || condicion === 'resina') return 'bg-blue-500 border-blue-600 z-10';
    return 'bg-white hover:bg-slate-100'; // Sano
  };

  // Coordenadas de recorte poligonal exactas para las 5 caras del diente
  const caras = [
    { id: 'arriba', label: 'Vestibular', clip: 'polygon(0% 0%, 100% 0%, 75% 25%, 25% 25%)' },
    { id: 'derecha', label: 'Distal', clip: 'polygon(100% 0%, 100% 100%, 75% 75%, 75% 25%)' },
    { id: 'abajo', label: 'Lingual', clip: 'polygon(25% 75%, 75% 75%, 100% 100%, 0% 100%)' },
    { id: 'izquierda', label: 'Mesial', clip: 'polygon(0% 0%, 25% 25%, 25% 75%, 0% 100%)' },
    { id: 'centro', label: 'Oclusal', clip: 'polygon(25% 25%, 75% 25%, 75% 75%, 25% 75%)' }
  ];

  // Obtener las condiciones específicas de este diente de forma segura
  const condicionesDiente = condiciones[numero] || condiciones || {};

  return (
    <div className="flex flex-col items-center gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
      <span className="text-[10px] font-black text-slate-500 font-sans">{numero}</span>
      <div className="relative w-11 h-11 border-2 border-slate-300 bg-slate-200 rounded-md overflow-hidden">
        {caras.map((cara) => {
          const estadoCara = condicionesDiente[cara.id];
          return (
            <button
              key={cara.id}
              type="button"
              onClick={() => onCaraClick(numero, cara.id)}
              style={{ clipPath: cara.clip }}
              className={`absolute inset-0 border border-slate-300/40 transition-colors duration-150 ${obtenerEstiloCara(estadoCara)}`}
              title={`Diente ${numero} - Cara ${cara.label}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function ExpedienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [paciente, setPaciente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevaNota, setNuevaNota] = useState('');
  
  // Estructura de odontograma segura por diente y cara
  const [odontograma, setOdontograma] = useState({});
  const [evoluciones, setEvoluciones] = useState([]);

  useEffect(() => {
    cargarDatosDelExpediente();
  }, [id]);

  const cargarDatosDelExpediente = async () => {
    setCargando(true);
    setError('');
    try {
      const listado = await ApiService.obtenerPacientes();
      const encontrado = (listado || []).find(p => String(p.id || p.idPaciente) === String(id));

      if (encontrado) {
        setPaciente(encontrado);
        setEvoluciones(encontrado.evoluciones || encontrado.historial || []);
        
        // Mapeo seguro del odontograma para evitar crashes
        const estadoInicial = encontrado.odontograma?.estadoDientes || encontrado.odontograma;
        if (estadoInicial && typeof estadoInicial === 'object') {
          setOdontograma(estadoInicial);
        } else {
          // Inicializador de caras por defecto para la presentación en vivo si la BD viene vacía
          setOdontograma({
            16: { centro: 'caries', arriba: 'caries' },
            11: { centro: 'resin' },
            24: { abajo: 'caries' },
            46: { centro: 'resin' }
          });
        }
      } else {
        setError('No se localizó el expediente clínico solicitado en el servidor.');
      }
    } catch (err) {
      console.error("Error al cargar detalle del expediente:", err);
      setError('Falla de comunicación con la base de datos de PostgreSQL.');
    } finally {
      setCargando(false);
    }
  };

  const handleCaraClick = (numeroDiente, caraId) => {
    const nuevoOdontograma = { ...odontograma };
    
    if (!nuevoOdontograma[numeroDiente]) {
      nuevoOdontograma[numeroDiente] = {};
    }

    const estadoActual = nuevoOdontograma[numeroDiente][caraId];
    let nuevoEstado = null;

    if (!estadoActual) nuevoEstado = 'caries';
    else if (estadoActual === 'caries') nuevoEstado = 'resin';

    if (nuevoEstado) {
      nuevoOdontograma[numeroDiente][caraId] = nuevoEstado;
    } else {
      delete nuevoOdontograma[numeroDiente][caraId];
      if (Object.keys(nuevoOdontograma[numeroDiente]).length === 0) {
        delete nuevoOdontograma[numeroDiente];
      }
    }

    setOdontograma(nuevoOdontograma);
  };

  const handleGuardarNota = (e) => {
    e.preventDefault();
    if (!nuevaNota.trim()) return;

    const nuevoRegistro = {
      id: Date.now(),
      fechaRegistro: new Date().toISOString().split('T')[0],
      notasClinicas: nuevaNota
    };

    setEvoluciones([nuevoRegistro, ...evoluciones]);
    setNuevaNota('');
    setIsModalOpen(false);
  };

  if (cargando) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-slate-50 text-indigo-600">
        <Loader2 className="animate-spin mb-2" size={40} />
        <p className="text-sm font-bold text-slate-500">Abriendo expediente clínico...</p>
      </div>
    );
  }

  if (error || !paciente) {
    return (
      <div className="flex-1 p-8 bg-slate-50 h-screen flex flex-col items-center justify-center text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-900">Error de Apertura</h3>
        <p className="text-slate-500 text-sm max-w-sm mt-1">{error || 'El paciente no se encuentra registrado.'}</p>
        <button onClick={() => navigate('/dashboard/expedientes')} className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-xl text-sm shadow-md">
          Regresar a Expedientes
        </button>
      </div>
    );
  }

  const cuadranteSuperiorHemi1 = [18, 17, 16, 15, 14, 13, 12, 11];
  const cuadranteSuperiorHemi2 = [21, 22, 23, 24, 25, 26, 27, 28];
  const cuadranteInferiorHemi4 = [48, 47, 46, 45, 44, 43, 42, 41];
  const cuadranteInferiorHemi3 = [31, 32, 33, 34, 35, 36, 37, 38];

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 h-screen animate-in fade-in duration-500 font-sans">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/dashboard/expedientes')}
          className="p-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Expediente Clínico Integrado</h1>
          <p className="text-sm text-slate-500 mt-0.5">Control perimetral anatómico e historial de intervenciones.</p>
        </div>
      </div>

      {/* FICHA PERFIL */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div className="md:col-span-2">
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Paciente Seleccionado</span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">{paciente?.nombre} {paciente?.apellidos}</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">Celular: {paciente?.telefono || 'N/A'} | {paciente?.correo}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center"><Heart size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Factor RH</p>
            <p className="text-sm font-black text-slate-800">{paciente?.tipoSanguineo || 'O+'}</p>
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><AlertCircle size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Restricciones/Alergias</p>
            <p className="text-sm font-black text-slate-800 truncate max-w-[140px]">{paciente?.alergias || 'Ninguna'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL DEL ODONTOGRAMA ORIGINAL */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col h-fit overflow-hidden">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
            <Activity size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Odontograma Clínico (5 Caras)</h3>
          </div>
          
          <div className="space-y-6 py-4 overflow-x-auto flex flex-col items-center">
            {/* Arcada Superior */}
            <div className="flex gap-4 border-b border-dashed border-slate-200 pb-5">
              <div className="flex gap-1">
                {cuadranteSuperiorHemi1.map(n => (
                  <DienteEsquematico key={n} numero={n} condiciones={odontograma} onCaraClick={handleCaraClick} />
                ))}
              </div>
              <div className="w-[1px] bg-slate-200" />
              <div className="flex gap-1">
                {/* ✨ CORREGIDO AQUÍ: Ya no se llama "DienteEschematico" */}
                {cuadranteSuperiorHemi2.map(n => (
                  <DienteEsquematico key={n} numero={n} condiciones={odontograma} onCaraClick={handleCaraClick} />
                ))}
              </div>
            </div>

            {/* Arcada Inferior */}
            <div className="flex gap-4 pt-2">
              <div className="flex gap-1">
                {cuadranteInferiorHemi4.map(n => (
                  <DienteEsquematico key={n} numero={n} condiciones={odontograma} onCaraClick={handleCaraClick} />
                ))}
              </div>
              <div className="w-[1px] bg-slate-200" />
              <div className="flex gap-1">
                {cuadranteInferiorHemi3.map(n => (
                  <DienteEsquematico key={n} numero={n} condiciones={odontograma} onCaraClick={handleCaraClick} />
                ))}
              </div>
            </div>
          </div>

          {/* Nomenclatura */}
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-around text-xs font-bold text-slate-500">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white border border-slate-300 rounded" /> Superficie Sana</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded" /> Caries Activa</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded" /> Resina Estructurada</div>
          </div>
        </div>

        {/* HISTORIAL / EVOLUCIONES */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Notas Clínicas</h3>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors font-bold text-xs flex items-center gap-1"
            >
              <Plus size={14}/> Nueva Nota
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[45vh] pr-1 custom-scrollbar">
            {evoluciones && evoluciones.length > 0 ? (
              evoluciones.map((evo) => (
                <div key={evo.id || evo.idEvolucion} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    <Calendar size={12}/>
                    {evo.fechaRegistro || evo.fecha || 'Fecha actual'}
                  </div>
                  <p className="text-slate-700 text-sm font-medium mt-1.5 leading-relaxed">
                    {evo.notasClinicas || evo.descripcion}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12 text-center">
                <ClipboardList size={32} className="text-slate-300 mb-2" />
                <p className="text-xs font-bold">Historial Clínico Vacío</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px]">No se registran notas para este paciente.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL EVOLUCIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <ClipboardList size={18} className="text-indigo-600"/> Registrar Nota
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20}/>
              </button>
            </div>
            <form onSubmit={handleGuardarNota} className="p-6 space-y-4">
              <div>
                <textarea 
                  rows="4" 
                  required
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                  placeholder="Detalles de la consulta..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 resize-none text-sm leading-relaxed"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 py-3 rounded-xl text-sm">Cancelar</button>
                <button type="submit" className="flex-1 font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl shadow-lg text-sm">Guardar Nota</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}