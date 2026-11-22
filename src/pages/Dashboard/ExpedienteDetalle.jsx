import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Activity, Calendar, Heart, AlertCircle, ClipboardList, 
  Loader2, X, Plus, Settings, ShieldAlert, PhoneCall, AlertTriangle, 
  UserCheck, MapPin, Shield
} from 'lucide-react';
import { ApiService } from '../../services/api.js';
import { DICCIONARIO_DIENTES } from '../../components/ui/OdontogramaAnatomico';
import ModalConfiguracionExpediente from '../../components/Modales/ModalConfiguracionExpediente.jsx';

// --- COMPONENTE INTERNO: Diente Esquemático Original de 5 Caras con Nombres Anatómicos ---
function DienteEsquematico({ numero, condiciones = {}, onCaraClick }) {
  const info = DICCIONARIO_DIENTES[numero] || { nombre: `Pieza ${numero}`, nombreCompleto: `Diente ${numero}` };

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
    <div 
      className="flex flex-col items-center gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm hover:border-indigo-300 transition-colors"
      title={`${info.nombreCompleto} (Pieza ${numero})`}
    >
      <span className="text-[10px] font-black text-slate-700 text-center leading-tight max-w-[56px] truncate">
        {info.nombre}
      </span>
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
              title={`${info.nombre} - Cara ${cara.label} (#${numero})`}
            />
          );
        })}
      </div>
      <span className="text-[9px] font-bold text-slate-400 font-mono px-1 rounded bg-slate-100">
        #{numero}
      </span>
    </div>
  );
}

export default function ExpedienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [paciente, setPaciente] = useState(null);
  const [expediente, setExpediente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
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
        
        // Conectar al endpoint real de Expedientes
        try {
          const expedienteReal = await ApiService.obtenerExpediente(id);
          
          // Guardamos el ID del expediente por si lo necesitamos para actualizar
          encontrado.expedienteId = expedienteReal.id;
          encontrado.alergias = expedienteReal.alergias;
          encontrado.tipoSanguineo = expedienteReal.tipoSanguineo;
          encontrado.enfermedadesCronicas = expedienteReal.enfermedadesCronicas;
          
          setExpediente(expedienteReal);
          setEvoluciones(expedienteReal.evoluciones || []);
          
          const estadoInicial = expedienteReal.odontograma?.estadoDientes;
          if (estadoInicial && typeof estadoInicial === 'object') {
            setOdontograma(estadoInicial);
          } else {
            setOdontograma({});
          }
        } catch (expError) {
          console.warn("El paciente no tiene un expediente inicializado en backend.");
          setExpediente(null);
          setEvoluciones([]);
          setOdontograma({});
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

  const handleExpedienteActualizado = (expedienteActualizado, pacienteActualizado) => {
    setExpediente(expedienteActualizado);
    setPaciente(prev => ({
      ...prev,
      ...pacienteActualizado,
      alergias: expedienteActualizado?.alergias || prev?.alergias,
      tipoSanguineo: expedienteActualizado?.tipoSanguineo || prev?.tipoSanguineo,
      enfermedadesCronicas: expedienteActualizado?.enfermedadesCronicas || prev?.enfermedadesCronicas
    }));
  };

  const handleCaraClick = async (numeroDiente, caraId) => {
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

    // Actualización optimista en UI
    setOdontograma(nuevoOdontograma);

    // Guardar en Backend
    if (paciente?.expedienteId) {
      try {
        await ApiService.actualizarOdontograma(paciente.expedienteId, nuevoOdontograma);
      } catch (err) {
        console.error("No se pudo guardar el odontograma:", err);
      }
    }
  };

  const handleGuardarNota = async (e) => {
    e.preventDefault();
    if (!nuevaNota.trim()) return;

    if (!paciente?.expedienteId) {
      alert("El paciente no tiene un expediente válido para registrar notas.");
      return;
    }

    try {
      // 1. Obtener citas del paciente para usar el ID real (regla del backend)
      const citasTodas = await ApiService.obtenerCitas();
      const idPacienteString = String(paciente.id || paciente.idPaciente);
      const citasDelPaciente = citasTodas.filter(c => String(c.paciente?.id) === idPacienteString);

      if (citasDelPaciente.length === 0) {
        alert("El paciente debe tener al menos una cita agendada en el sistema para poder registrarle una nota clínica.");
        return;
      }

      // 2. Usar el ID de su cita más reciente
      const idCitaValida = citasDelPaciente[citasDelPaciente.length - 1].id;

      const evolucionGuardada = await ApiService.agregarEvolucion(paciente.expedienteId, idCitaValida, nuevaNota);
      setEvoluciones([evolucionGuardada, ...evoluciones]);
      setNuevaNota('');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar la nota", error);
      alert("Hubo un error al guardar la nota clínica en el servidor.");
    }
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
        <button onClick={() => navigate('/admin/expedientes')} className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-xl text-sm shadow-md">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/expedientes')}
            className="p-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Expediente Clínico Integrado</h1>
            <p className="text-sm text-slate-500 mt-0.5">Control perimetral anatómico y normativo NOM-004-SSA3-2012 / NOM-013-SSA2-2015.</p>
          </div>
        </div>

        <button
          onClick={() => setIsConfigModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Settings size={18} />
          Configurar Expediente (NOM-004)
        </button>
      </div>

      {/* FICHA PERFIL */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 mb-8 flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-2">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Paciente Seleccionado</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">{paciente?.nombre} {paciente?.apellidos}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-medium mt-1">
              <span>Celular: {paciente?.telefono || 'N/A'}</span>
              <span>•</span>
              <span>{paciente?.correo}</span>
              {paciente?.fechaNacimiento && (
                <>
                  <span>•</span>
                  <span>Nacimiento: {paciente?.fechaNacimiento}</span>
                </>
              )}
              {paciente?.sexo && (
                <>
                  <span>•</span>
                  <span>Sexo: {paciente?.sexo}</span>
                </>
              )}
            </div>
            {paciente?.direccion && (
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <span>{paciente.direccion}</span>
              </p>
            )}
            {paciente?.contactoEmergenciaNombre && (
              <p className="text-xs text-slate-700 font-semibold mt-1 flex items-center gap-1">
                <PhoneCall size={13} className="text-teal-600 shrink-0" />
                <span>Emergencia: {paciente.contactoEmergenciaNombre} ({paciente.contactoEmergenciaTelefono || 'Sin teléfono'})</span>
              </p>
            )}
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0"><Heart size={20}/></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Factor RH</p>
              <p className="text-sm font-black text-slate-800">{expediente?.tipoSanguineo || paciente?.tipoSanguineo || 'O+'}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"><AlertCircle size={20}/></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Restricciones/Alergias</p>
              <p className="text-sm font-black text-slate-800 truncate max-w-[140px]" title={expediente?.alergias || paciente?.alergias || 'Ninguna'}>
                {expediente?.alergias || paciente?.alergias || 'Ninguna'}
              </p>
            </div>
          </div>
        </div>

        {/* BANDERAS DE ALERTA MÉDICA NOM-013-SSA2-2015 */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-2.5">
            <ShieldAlert size={16} className="text-slate-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Alertas Estomatológicas y Riesgos Sistémicos (NOM-013)
            </h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {expediente?.alergiaAnestesia && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full text-xs font-bold animate-pulse">
                <AlertTriangle size={13} className="text-red-600" />
                PELIGRO: Alergia a Anestésicos Locales (Evitar Lidocaína/Mepivacaína)
              </span>
            )}
            {expediente?.problemasCoagulacion && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full text-xs font-bold">
                <AlertTriangle size={13} className="text-red-600" />
                ALERTA: Coagulopatía / Anticoagulantes (Riesgo de Hemorragia)
              </span>
            )}
            {expediente?.cardiopatias && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-xs font-bold">
                <Heart size={13} className="text-rose-600" />
                ALERTA: Cardiopatía (Requiere Profilaxis Antibiótica)
              </span>
            )}
            {expediente?.hipertension && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-bold">
                <AlertCircle size={13} className="text-amber-600" />
                ALERTA: Hipertensión Arterial (Evitar vasoconstrictores / epinefrina)
              </span>
            )}
            {expediente?.diabetes && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-bold">
                <AlertCircle size={13} className="text-amber-600" />
                ALERTA: Diabetes Mellitus (Riesgo infeccioso y cicatrización)
              </span>
            )}
            {expediente?.embarazo && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded-full text-xs font-bold">
                <AlertCircle size={13} className="text-purple-600" />
                PRECAUCIÓN: Paciente en Embarazo (Restricción Rx y fármacos)
              </span>
            )}
            {expediente?.alergiaLatex && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded-full text-xs font-bold">
                <AlertCircle size={13} className="text-orange-600" />
                ALERTA: Alergia al Látex (Usar instrumental y guantes de nitrilo)
              </span>
            )}

            {!expediente?.alergiaAnestesia &&
             !expediente?.problemasCoagulacion &&
             !expediente?.cardiopatias &&
             !expediente?.hipertension &&
             !expediente?.diabetes &&
             !expediente?.embarazo &&
             !expediente?.alergiaLatex && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                <Shield size={13} className="text-emerald-600" />
                Sin alertas sistémicas de alto riesgo registradas
              </span>
            )}

            {expediente?.medicamentosActuales && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-medium">
                <ClipboardList size={13} className="text-slate-500" />
                Medicamentos: {expediente.medicamentosActuales}
              </span>
            )}
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
          
          <div className="space-y-6 py-4 overflow-x-auto">
            <div className="min-w-max mx-auto px-4 flex flex-col items-center space-y-6">
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

      {/* MODAL CONFIGURACIÓN EXPEDIENTE NOM-004 / NOM-013 */}
      <ModalConfiguracionExpediente
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        paciente={paciente}
        expediente={expediente}
        onGuardadoExitoso={handleExpedienteActualizado}
      />

    </div>
  );
}