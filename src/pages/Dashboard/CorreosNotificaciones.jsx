import { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  Eye,
  Save,
  Sparkles,
  FileCode,
  ExternalLink
} from 'lucide-react';
import { EmailQueueService, VARIABLES_DISPONIBLES } from '../../services/emailQueueService';

export default function CorreosNotificaciones() {
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');

  useEffect(() => {
    const listaPlantillas = EmailQueueService.obtenerPlantillas();
    setPlantillas(listaPlantillas);
    if (listaPlantillas.length > 0) {
      setPlantillaSeleccionada(listaPlantillas[0]);
    }
  }, []);

  const mostrarToast = (texto) => {
    setMensajeExito(texto);
    setTimeout(() => {
      setMensajeExito((actual) => (actual === texto ? '' : actual));
    }, 3200);
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

  const handleProbarEnGmail = () => {
    if (!plantillaSeleccionada) return;
    EmailQueueService.guardarPlantilla(plantillaSeleccionada);
    EmailQueueService.enviarConfirmacionCita(
      'juan.perez@correo.com',
      'Juan Pérez García',
      'Dra. Elena Solís',
      '2026-11-12 a las 10:30 hrs',
      {
        plantillaId: plantillaSeleccionada.id,
        abrirGmail: true
      }
    );
    mostrarToast(`Abriendo "${plantillaSeleccionada.nombre}" en Gmail...`);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 h-screen animate-in fade-in duration-500 font-sans">
      {/* CABECERA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Mail className="text-indigo-600" size={32} /> Correos y Notificaciones
          </h1>
          <p className="text-slate-500 mt-1">
            Personalización de plantillas de correo para el envío directo de citas por Gmail.
          </p>
        </div>
      </div>

      {/* ALERTA DE ÉXITO */}
      {mensajeExito && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <p className="text-sm font-bold">{mensajeExito}</p>
        </div>
      )}

      {/* CONFIGURACIÓN DE PLANTILLAS DE CORREO */}
      {plantillaSeleccionada && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LISTA LATERAL DE PLANTILLAS */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-white p-5 rounded-[28px] border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <FileCode size={14} className="text-indigo-600" /> Plantillas
                </h3>
                <span className="text-[11px] font-bold text-indigo-600">
                  {plantillas.filter((p) => p.activa).length}/{plantillas.length} activas
                </span>
              </div>
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
                Haz clic en una variable para insertarla en el cuerpo por defecto:
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
                    Se utiliza al agendar o confirmar citas para prellenar el correo.
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
                  Activa
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
                  <label className="text-xs font-bold text-slate-700">Color</label>
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
                <label className="text-xs font-bold text-slate-700">Asunto por Defecto *</label>
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
                <label className="text-xs font-bold text-slate-700">Encabezado *</label>
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
                  Cuerpo por Defecto (Body del correo) *
                </label>
                <textarea
                  rows="8"
                  required
                  value={plantillaSeleccionada.cuerpo}
                  onChange={(e) =>
                    setPlantillaSeleccionada({ ...plantillaSeleccionada, cuerpo: e.target.value })
                  }
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono leading-relaxed text-slate-800 focus:outline-none focus:border-indigo-600 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pie de Página</label>
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
                  onClick={handleProbarEnGmail}
                  className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send size={15} /> Abrir en Gmail <ExternalLink size={13} />
                </button>
              </div>
            </form>
          </div>

          {/* PREVISUALIZACIÓN EN VIVO */}
          <div className="lg:col-span-4 bg-white p-6 rounded-[32px] border border-slate-200 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Vista Previa Renderizada
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                Borrador Gmail
              </span>
            </div>

            <div className="flex-1 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 p-4 flex flex-col">
              <div className="bg-white rounded-xl p-3 mb-3 border border-slate-200 text-xs space-y-1">
                <p className="text-slate-400">
                  <span className="font-bold text-slate-600">Para:</span> Juan Pérez García
                  &lt;juan.perez@correo.com&gt;
                </p>
                <p className="text-slate-800 font-bold pt-1 border-t border-slate-100">
                  {EmailQueueService.renderizarTexto(plantillaSeleccionada.asunto)}
                </p>
              </div>

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
    </div>
  );
}
