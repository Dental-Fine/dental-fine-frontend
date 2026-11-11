import { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  Plus,
  Trash2,
  Eye,
  Save,
  Settings,
  Sparkles,
  FileCode,
  Layers,
  X,
  Zap,
  Loader2
} from 'lucide-react';
import { EmailQueueService, VARIABLES_DISPONIBLES } from '../../services/emailQueueService';

export default function CorreosNotificaciones() {
  const [vistaActiva, setVistaActiva] = useState('plantillas'); // 'plantillas' | 'cola' | 'config'
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [cola, setCola] = useState([]);
  const [config, setConfig] = useState(EmailQueueService.obtenerConfiguracion());

  const [filtroCola, setFiltroCola] = useState('TODOS');
  const [mensajeExito, setMensajeExito] = useState('');
  const [jobEnInspeccion, setJobEnInspeccion] = useState(null);
  const [modalNuevoEnvio, setModalNuevoEnvio] = useState(false);

  // Campos para encolar un envío manual o de prueba
  const [nuevoEnvioDestinatario, setNuevoEnvioDestinatario] = useState('Luis Enrique Fonseca');
  const [nuevoEnvioCorreo, setNuevoEnvioCorreo] = useState('luis.fonseca@correo.com');
  const [nuevoEnvioPlantillaId, setNuevoEnvioPlantillaId] = useState('CONFIRMACION_CITA');
  const [nuevoEnvioPrioridad, setNuevoEnvioPrioridad] = useState('ALTA');
  const [nuevoEnvioSimularFallo, setNuevoEnvioSimularFallo] = useState(false);

  useEffect(() => {
    const listaPlantillas = EmailQueueService.obtenerPlantillas();
    setPlantillas(listaPlantillas);
    if (listaPlantillas.length > 0) {
      setPlantillaSeleccionada(listaPlantillas[0]);
    }
    setCola(EmailQueueService.obtenerCola());
  }, []);

  // Worker asíncrono en segundo plano que procesa elementos EN_COLA
  useEffect(() => {
    if (!config.workerActivo) return;

    const intervaloMs = Math.max(2, Number(config.intervaloSegundos) || 4) * 1000;
    const timer = setInterval(() => {
      procesarSiguienteEnCola();
    }, intervaloMs);

    return () => clearInterval(timer);
  }, [config.workerActivo, config.intervaloSegundos, cola]);

  const mostrarToast = (texto) => {
    setMensajeExito(texto);
    setTimeout(() => {
      setMensajeExito((actual) => (actual === texto ? '' : actual));
    }, 3200);
  };

  const procesarSiguienteEnCola = () => {
    const colaActual = EmailQueueService.obtenerCola();
    const indicePendiente = colaActual.findIndex((j) => j.estado === 'EN_COLA');
    if (indicePendiente === -1) return;

    const jobObjetivo = colaActual[indicePendiente];

    // 1. Pasar a estado PROCESANDO
    const colaProcesando = colaActual.map((item, idx) =>
      idx === indicePendiente
        ? { ...item, estado: 'PROCESANDO', intentos: (item.intentos || 0) + 1 }
        : item
    );
    EmailQueueService.guardarCola(colaProcesando);
    setCola(colaProcesando);

    // 2. Completar envío asíncrono tras simular latencia de red SMTP
    setTimeout(() => {
      const colaReciente = EmailQueueService.obtenerCola();
      const colaFinal = colaReciente.map((item) => {
        if (item.id !== jobObjetivo.id) return item;

        const fallaSimulada =
          item.simularError || item.destinatarioCorreo.includes('invalido');

        if (fallaSimulada) {
          const intentosActuales = item.intentos || 1;
          const agotoReintentos = intentosActuales >= (item.maxIntentos || 3);
          return {
            ...item,
            estado: agotoReintentos ? 'ERROR' : 'EN_COLA',
            procesadoEn: new Date().toISOString(),
            latenciaMs: Math.floor(600 + Math.random() * 500),
            errorDetalle: agotoReintentos
              ? `SMTP 550: Error de entrega tras ${intentosActuales} intentos asíncronos.`
              : `Intento ${intentosActuales} fallido. Reencolado automáticamente para reintento.`
          };
        }

        return {
          ...item,
          estado: 'ENVIADO',
          procesadoEn: new Date().toISOString(),
          latenciaMs: Math.floor(210 + Math.random() * 280),
          errorDetalle: null
        };
      });

      EmailQueueService.guardarCola(colaFinal);
      setCola(colaFinal);
    }, 900);
  };

  const handleGuardarPlantilla = (e) => {
    e.preventDefault();
    if (!plantillaSeleccionada) return;
    const actualizadas = EmailQueueService.guardarPlantilla(plantillaSeleccionada);
    setPlantillas(actualizadas);
    mostrarToast(`Plantilla "${plantillaSeleccionada.nombre}" guardada correctamente.`);
  };

  const handleInsertarVariable = (tag) => {
    if (!plantillaSeleccionada) return;
    setPlantillaSeleccionada({
      ...plantillaSeleccionada,
      cuerpo: `${plantillaSeleccionada.cuerpo} ${tag}`
    });
  };

  const handleEncolarPruebaDesdePlantilla = () => {
    if (!plantillaSeleccionada) return;
    EmailQueueService.guardarPlantilla(plantillaSeleccionada);
    const nuevoJob = EmailQueueService.encolarCorreo({
      plantillaId: plantillaSeleccionada.id,
      prioridad: 'ALTA',
      variables: {
        paciente: 'Luis Enrique Fonseca Sosa',
        correo: 'luis.fonseca@dentalfine.com',
        dentista: 'Dra. Elena Solís',
        servicio: 'Limpieza Dental Ultrasónica',
        fecha: new Date().toISOString().split('T')[0],
        hora: '10:30 hrs',
        clinica: 'Dental Fine - Clínica Central',
        folio: `#DF-${Math.floor(100 + Math.random() * 900)}`,
        notas: 'Prueba de plantilla generada desde el configurador.'
      }
    });
    setCola(EmailQueueService.obtenerCola());
    mostrarToast(`Correo de prueba (${nuevoJob.id}) añadido a la cola asíncrona.`);
  };

  const handleCrearEnvioManual = (e) => {
    e.preventDefault();
    const nuevoJob = EmailQueueService.encolarCorreo({
      plantillaId: nuevoEnvioPlantillaId,
      prioridad: nuevoEnvioPrioridad,
      simularError: nuevoEnvioSimularFallo,
      variables: {
        paciente: nuevoEnvioDestinatario,
        correo: nuevoEnvioCorreo,
        dentista: 'Dra. Elena Solís',
        servicio: 'Consulta Dental Especializada',
        fecha: new Date().toISOString().split('T')[0],
        hora: '12:00 hrs',
        clinica: 'Dental Fine - Clínica Central',
        folio: `#DF-${Math.floor(100 + Math.random() * 900)}`,
        notas: 'Notificación encolada manualmente desde el monitor.'
      }
    });
    setCola(EmailQueueService.obtenerCola());
    setModalNuevoEnvio(false);
    mostrarToast(`Trabajo ${nuevoJob.id} agregado a la cola de envíos asíncronos.`);
  };

  const handleToggleWorker = () => {
    const nueva = EmailQueueService.guardarConfiguracion({
      workerActivo: !config.workerActivo
    });
    setConfig(nueva);
    mostrarToast(
      nueva.workerActivo
        ? 'Worker de envíos asíncronos reanudado.'
        : 'Worker de envíos asíncronos en pausa.'
    );
  };

  const handleGuardarConfig = (e) => {
    e.preventDefault();
    const guardada = EmailQueueService.guardarConfiguracion(config);
    setConfig(guardada);
    mostrarToast('Configuración de la cola asíncrona y servidor SMTP actualizada.');
  };

  const handleReintentarJob = (jobId) => {
    const nuevaCola = EmailQueueService.reintentarTrabajo(jobId);
    setCola(nuevaCola);
    mostrarToast(`Trabajo ${jobId} reencolado para envío asíncrono.`);
  };

  const handleEliminarJob = (jobId) => {
    const nuevaCola = EmailQueueService.eliminarTrabajo(jobId);
    setCola(nuevaCola);
  };

  const handleLimpiarEnviados = () => {
    const nuevaCola = EmailQueueService.limpiarEnviados();
    setCola(nuevaCola);
    mostrarToast('Historial de trabajos enviados depurado de la cola.');
  };

  const totalEnCola = cola.filter((j) => j.estado === 'EN_COLA' || j.estado === 'PROCESANDO').length;
  const totalEnviados = cola.filter((j) => j.estado === 'ENVIADO').length;
  const totalErrores = cola.filter((j) => j.estado === 'ERROR').length;

  const colaFiltrada = cola.filter((j) => {
    if (filtroCola === 'TODOS') return true;
    return j.estado === filtroCola;
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 h-screen animate-in fade-in duration-500 font-sans">
      {/* CABECERA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Mail className="text-indigo-600" size={32} /> Correos y Notificaciones
          </h1>
          <p className="text-slate-500 mt-1">
            Configuración de plantillas de correo y cola de envíos automáticos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleToggleWorker}
            className={`px-4 py-3 rounded-2xl font-black text-xs flex items-center gap-2 border transition-all cursor-pointer ${
              config.workerActivo
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
          >
            {config.workerActivo ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <Pause size={15} /> Envío Automático: Activo
              </>
            ) : (
              <>
                <Play size={15} /> Envío Automático: En Pausa
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setModalNuevoEnvio(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 text-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Nuevo Envío
          </button>
        </div>
      </div>

      {/* ALERTA DE ÉXITO */}
      {mensajeExito && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <p className="text-sm font-bold">{mensajeExito}</p>
        </div>
      )}

      {/* MÉTRICAS DEL SISTEMA DE ENVÍOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Trabajos en Cola
            </p>
            <h3 className="text-3xl font-black text-indigo-600 mt-1">{totalEnCola}</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Intervalo: cada {config.intervaloSegundos}s
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Correos Enviados
            </p>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">{totalEnviados}</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Entrega asíncrona verificada
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Send size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Fallos / Reintentos
            </p>
            <h3 className="text-3xl font-black text-red-600 mt-1">{totalErrores}</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Máx. {config.maxReintentos} intentos por correo
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Plantillas Activas
            </p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">
              {plantillas.filter((p) => p.activa).length} / {plantillas.length}
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Con variables dinámicas
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileCode size={22} />
          </div>
        </div>
      </div>

      {/* NAVEGACIÓN DE PESTAÑAS DEL MÓDULO */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-2xl border border-slate-200 w-fit shadow-2xs">
        <button
          type="button"
          onClick={() => setVistaActiva('plantillas')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            vistaActiva === 'plantillas'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCode size={16} /> Plantillas de Correo
        </button>

        <button
          type="button"
          onClick={() => setVistaActiva('cola')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            vistaActiva === 'cola'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers size={16} /> Cola de Envíos
          {totalEnCola > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
              {totalEnCola}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setVistaActiva('config')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            vistaActiva === 'config'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings size={16} /> Configuración
        </button>
      </div>

      {/* =========================================================
          VISTA 1: CONFIGURACIÓN DE PLANTILLAS DE CORREO
          ========================================================= */}
      {vistaActiva === 'plantillas' && plantillaSeleccionada && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LISTA LATERAL DE PLANTILLAS */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-white p-5 rounded-[28px] border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">
                Plantillas del Sistema
              </h3>
              <div className="space-y-2">
                {plantillas.map((tpl) => {
                  const activa = tpl.id === plantillaSeleccionada.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setPlantillaSeleccionada(tpl)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        activa
                          ? 'bg-indigo-50/80 border-indigo-500 shadow-2xs'
                          : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-slate-900">{tpl.nombre}</span>
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            tpl.activa ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{tpl.evento}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GUÍA DE VARIABLES DINÁMICAS */}
            <div className="bg-white p-5 rounded-[28px] border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-1.5">
                <Sparkles size={14} /> Variables Dinámicas
              </h3>
              <p className="text-[11px] text-slate-500">
                Haz clic en cualquier variable para insertarla en el cuerpo de la plantilla:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLES_DISPONIBLES.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => handleInsertarVariable(v.tag)}
                    title={`${v.descripcion} (Ej: ${v.ejemplo})`}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-mono text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    {v.tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* EDITOR DE LA PLANTILLA */}
          <div className="lg:col-span-5 bg-white p-6 rounded-[32px] border border-slate-200 shadow-2xs">
            <form onSubmit={handleGuardarPlantilla} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Editor de Plantilla</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    ID: <span className="font-mono">{plantillaSeleccionada.id}</span>
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plantillaSeleccionada.activa}
                    onChange={(e) =>
                      setPlantillaSeleccionada({
                        ...plantillaSeleccionada,
                        activa: e.target.checked
                      })
                    }
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  Plantilla Activa
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nombre de la Plantilla *</label>
                  <input
                    type="text"
                    required
                    value={plantillaSeleccionada.nombre}
                    onChange={(e) =>
                      setPlantillaSeleccionada({ ...plantillaSeleccionada, nombre: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Color Acento</label>
                  <input
                    type="color"
                    value={plantillaSeleccionada.colorAcento || '#4f46e5'}
                    onChange={(e) =>
                      setPlantillaSeleccionada({
                        ...plantillaSeleccionada,
                        colorAcento: e.target.value
                      })
                    }
                    className="w-full h-11 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Asunto del Correo (Subject) *</label>
                <input
                  type="text"
                  required
                  value={plantillaSeleccionada.asunto}
                  onChange={(e) =>
                    setPlantillaSeleccionada({ ...plantillaSeleccionada, asunto: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Encabezado Principal *</label>
                <input
                  type="text"
                  required
                  value={plantillaSeleccionada.encabezado}
                  onChange={(e) =>
                    setPlantillaSeleccionada({
                      ...plantillaSeleccionada,
                      encabezado: e.target.value
                    })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Cuerpo del Mensaje (Soporta variables {'{{...}}'}) *
                </label>
                <textarea
                  rows="7"
                  required
                  value={plantillaSeleccionada.cuerpo}
                  onChange={(e) =>
                    setPlantillaSeleccionada({ ...plantillaSeleccionada, cuerpo: e.target.value })
                  }
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono leading-relaxed text-slate-800 focus:outline-none focus:border-indigo-600 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pie de Página (Footer)</label>
                <input
                  type="text"
                  value={plantillaSeleccionada.piePagina}
                  onChange={(e) =>
                    setPlantillaSeleccionada({
                      ...plantillaSeleccionada,
                      piePagina: e.target.value
                    })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Save size={15} /> Guardar Plantilla
                </button>
                <button
                  type="button"
                  onClick={handleEncolarPruebaDesdePlantilla}
                  className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send size={15} /> Encolar Prueba
                </button>
              </div>
            </form>
          </div>

          {/* PREVISUALIZACIÓN HTML EN VIVO */}
          <div className="lg:col-span-4 bg-white p-6 rounded-[32px] border border-slate-200 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Vista Previa Renderizada
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                HTML Live
              </span>
            </div>

            <div className="flex-1 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 p-4 flex flex-col">
              <div className="bg-white rounded-xl p-3 mb-3 border border-slate-200 text-xs space-y-1">
                <p className="text-slate-400">
                  <span className="font-bold text-slate-600">De:</span> {config.remitenteNombre} &lt;
                  {config.remitenteCorreo}&gt;
                </p>
                <p className="text-slate-400">
                  <span className="font-bold text-slate-600">Para:</span> Juan Pérez García
                  &lt;juan.perez@correo.com&gt;
                </p>
                <p className="text-slate-800 font-bold pt-1 border-t border-slate-100">
                  {EmailQueueService.renderizarTexto(plantillaSeleccionada.asunto)}
                </p>
              </div>

              {/* Cuerpo visual del correo */}
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs flex-1 flex flex-col">
                <div
                  style={{ backgroundColor: plantillaSeleccionada.colorAcento || '#4f46e5' }}
                  className="p-5 text-white text-center"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                    Dental Fine Clínica Dental
                  </p>
                  <h4 className="text-lg font-black mt-1">{plantillaSeleccionada.encabezado}</h4>
                </div>

                <div className="p-5 text-xs text-slate-700 whitespace-pre-line leading-relaxed flex-1">
                  {EmailQueueService.renderizarTexto(plantillaSeleccionada.cuerpo)}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 text-center">
                  {plantillaSeleccionada.piePagina}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          VISTA 2: MONITOR DE COLA DE ENVÍOS ASÍNCRONOS
          ========================================================= */}
      {vistaActiva === 'cola' && (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-2">
              {['TODOS', 'EN_COLA', 'PROCESANDO', 'ENVIADO', 'ERROR'].map((estado) => (
                <button
                  key={estado}
                  type="button"
                  onClick={() => setFiltroCola(estado)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    filtroCola === estado
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {estado === 'TODOS'
                    ? `Todos (${cola.length})`
                    : estado === 'EN_COLA'
                    ? `En Cola (${cola.filter((c) => c.estado === 'EN_COLA').length})`
                    : estado === 'PROCESANDO'
                    ? `Procesando (${cola.filter((c) => c.estado === 'PROCESANDO').length})`
                    : estado === 'ENVIADO'
                    ? `Enviados (${totalEnviados})`
                    : `Errores (${totalErrores})`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={procesarSiguienteEnCola}
                disabled={totalEnCola === 0}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 text-indigo-700 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap size={14} /> Despachar Siguiente Ahora
              </button>
              <button
                type="button"
                onClick={handleLimpiarEnviados}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 size={14} /> Limpiar Enviados
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {colaFiltrada.length > 0 ? (
              colaFiltrada.map((job) => {
                const esEnviado = job.estado === 'ENVIADO';
                const esError = job.estado === 'ERROR';
                const esProcesando = job.estado === 'PROCESANDO';

                return (
                  <div
                    key={job.id}
                    className="p-6 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                          #{job.id}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                            esEnviado
                              ? 'bg-emerald-100 text-emerald-800'
                              : esProcesando
                              ? 'bg-indigo-100 text-indigo-800'
                              : esError
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {esProcesando && <Loader2 size={12} className="animate-spin" />}
                          {job.estado}
                        </span>

                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                            job.prioridad === 'ALTA'
                              ? 'border-red-200 text-red-600 bg-red-50'
                              : 'border-slate-200 text-slate-500 bg-white'
                          }`}
                        >
                          Prioridad {job.prioridad}
                        </span>

                        <span className="text-xs font-bold text-indigo-600">
                          {job.plantillaNombre}
                        </span>
                      </div>

                      <p className="text-sm font-black text-slate-900">{job.asuntoRenderizado}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span>
                          Destinatario: <strong className="text-slate-700">{job.destinatarioNombre}</strong> ({job.destinatarioCorreo})
                        </span>
                        <span>
                          Intentos: <strong>{job.intentos}/{job.maxIntentos}</strong>
                        </span>
                        {job.latenciaMs && <span>Latencia SMTP: <strong>{job.latenciaMs} ms</strong></span>}
                      </div>

                      {job.errorDetalle && (
                        <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700 font-medium flex items-center gap-2">
                          <AlertCircle size={14} className="shrink-0" />
                          <span>{job.errorDetalle}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setJobEnInspeccion(job)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye size={14} /> Ver Correo
                      </button>

                      {esError && (
                        <button
                          type="button"
                          onClick={() => handleReintentarJob(job.id)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RefreshCw size={14} /> Reintentar
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleEliminarJob(job.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eliminar de la cola"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-16 text-center text-slate-400">
                <Mail size={42} className="mx-auto mb-3 text-slate-200" />
                <p className="text-sm font-bold text-slate-600">No hay trabajos en esta vista de la cola</p>
                <p className="text-xs text-slate-400 mt-1">
                  Los correos generados al agendar o confirmar citas en recepción aparecerán aquí.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          VISTA 3: CONFIGURACIÓN DEL MOTOR DE COLA Y SMTP
          ========================================================= */}
      {vistaActiva === 'config' && (
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-2xs max-w-3xl">
          <h3 className="text-xl font-black text-slate-900 mb-1">
            Parámetros del Worker Asíncrono y Servidor SMTP
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Ajusta la concurrencia, política de reintentos y disparadores automáticos desde recepción.
          </p>

          <form onSubmit={handleGuardarConfig} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nombre del Remitente</label>
                <input
                  type="text"
                  required
                  value={config.remitenteNombre}
                  onChange={(e) => setConfig({ ...config, remitenteNombre: e.target.value })}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Correo Remitente Oficial</label>
                <input
                  type="email"
                  required
                  value={config.remitenteCorreo}
                  onChange={(e) => setConfig({ ...config, remitenteCorreo: e.target.value })}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-700">Host SMTP / Relay</label>
                <input
                  type="text"
                  required
                  value={config.servidorSmtp}
                  onChange={(e) => setConfig({ ...config, servidorSmtp: e.target.value })}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Hilos / Concurrencia</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.concurrenciaWorkers}
                  onChange={(e) =>
                    setConfig({ ...config, concurrenciaWorkers: Number(e.target.value) })
                  }
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Máximo de Reintentos</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={config.maxReintentos}
                  onChange={(e) => setConfig({ ...config, maxReintentos: Number(e.target.value) })}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Intervalo de Poll (seg)</label>
                <input
                  type="number"
                  min="2"
                  max="60"
                  value={config.intervaloSegundos}
                  onChange={(e) =>
                    setConfig({ ...config, intervaloSegundos: Number(e.target.value) })
                  }
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.encolarAlConfirmarRecepcion}
                  onChange={(e) =>
                    setConfig({ ...config, encolarAlConfirmarRecepcion: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                Encolar correo automáticamente al confirmar cita y trasladar al historial en recepción
              </label>

              <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.encolarAlAgendar}
                  onChange={(e) => setConfig({ ...config, encolarAlAgendar: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                Encolar correo de confirmación al agendar o reprogramar una cita
              </label>
            </div>

            <button
              type="submit"
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Save size={16} /> Guardar Configuración
            </button>
          </form>
        </div>
      )}

      {/* MODAL PARA INSPECCIONAR UN CORREO EN LA COLA */}
      {jobEnInspeccion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Detalle del Trabajo Asíncrono {jobEnInspeccion.id}
                </h3>
                <p className="text-xs text-slate-400">{jobEnInspeccion.plantillaNombre}</p>
              </div>
              <button
                onClick={() => setJobEnInspeccion(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <p>
                  <span className="font-bold text-slate-500">Para:</span>{' '}
                  {jobEnInspeccion.destinatarioNombre} ({jobEnInspeccion.destinatarioCorreo})
                </p>
                <p>
                  <span className="font-bold text-slate-500">Asunto:</span>{' '}
                  <strong className="text-slate-900">{jobEnInspeccion.asuntoRenderizado}</strong>
                </p>
                <p>
                  <span className="font-bold text-slate-500">Estado:</span> {jobEnInspeccion.estado} (
                  {jobEnInspeccion.intentos}/{jobEnInspeccion.maxIntentos} intentos)
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 whitespace-pre-line text-slate-700 leading-relaxed font-sans">
                {jobEnInspeccion.cuerpoRenderizado}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA ENCOLAR UN ENVÍO MANUAL */}
      {modalNuevoEnvio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-lg">Encolar Nuevo Correo Asíncrono</h3>
              <button
                onClick={() => setModalNuevoEnvio(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCrearEnvioManual} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nombre del Paciente *</label>
                <input
                  type="text"
                  required
                  value={nuevoEnvioDestinatario}
                  onChange={(e) => setNuevoEnvioDestinatario(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Correo Destinatario *</label>
                <input
                  type="email"
                  required
                  value={nuevoEnvioCorreo}
                  onChange={(e) => setNuevoEnvioCorreo(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Plantilla a Utilizar *</label>
                <select
                  value={nuevoEnvioPlantillaId}
                  onChange={(e) => setNuevoEnvioPlantillaId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  {plantillas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Prioridad en la Cola</label>
                <select
                  value={nuevoEnvioPrioridad}
                  onChange={(e) => setNuevoEnvioPrioridad(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  <option value="ALTA">ALTA (Inmediata)</option>
                  <option value="NORMAL">NORMAL (Estándar)</option>
                  <option value="BAJA">BAJA (Lote / Recordatorio)</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={nuevoEnvioSimularFallo}
                  onChange={(e) => setNuevoEnvioSimularFallo(e.target.checked)}
                  className="rounded border-slate-300 text-red-600"
                />
                Simular fallo de entrega SMTP (para probar política de reintentos)
              </label>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNuevoEnvio(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs cursor-pointer"
                >
                  Agregar a la Cola
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
