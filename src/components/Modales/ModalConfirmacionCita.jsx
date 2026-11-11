import { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  Mail,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { EmailQueueService } from '../../services/emailQueueService';

export default function ModalConfirmacionCita({ isOpen, cita, onClose, onConfirmado }) {
  const [estadoResolucion, setEstadoResolucion] = useState('FINALIZADA');
  const [notasRecepcion, setNotasRecepcion] = useState('');
  const [enviarCorreoAsync, setEnviarCorreoAsync] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [confirmadoExito, setConfirmadoExito] = useState(false);

  useEffect(() => {
    if (isOpen && cita) {
      setEstadoResolucion('FINALIZADA');
      setNotasRecepcion('Paciente asistió puntualmente. Consulta concluida.');
      const config = EmailQueueService.obtenerConfiguracion();
      setEnviarCorreoAsync(config.encolarAlConfirmarRecepcion !== false);
      setProcesando(false);
      setConfirmadoExito(false);
    }
  }, [isOpen, cita]);

  if (!isOpen || !cita) return null;

  const idCita = cita.id || cita.idCita;
  const nombrePaciente = cita.paciente?.nombre
    ? `${cita.paciente.nombre} ${cita.paciente.apellidos || ''}`.trim()
    : cita.nombrePaciente || `Paciente #${cita.idPaciente || cita.paciente?.id || idCita}`;
  const correoPaciente = cita.paciente?.correo || 'paciente@dentalfine.com';
  const nombreDentista = cita.dentista?.nombre
    ? `Dr(a). ${cita.dentista.nombre}`
    : cita.nombreDentista || `Especialista #${cita.idDentista || cita.dentista?.id || '1'}`;
  const nombreServicio = cita.tipoServicio?.nombre || cita.nombre || 'Consulta Dental Programada';
  const fechaStr = cita.fecha ? cita.fecha.split('T')[0] : 'Fecha programada';
  const horaStr = cita.fecha && cita.fecha.includes('T') ? cita.fecha.split('T')[1].substring(0, 5) : '00:00';

  const notasRapidas =
    estadoResolucion === 'FINALIZADA'
      ? [
          'Paciente asistió puntualmente.',
          'Consulta concluida sin observaciones.',
          'Requiere agendar cita de seguimiento.'
        ]
      : [
          'No se presentó tras 15 min de tolerancia.',
          'Avisó por teléfono que no podría asistir.'
        ];

  const handleConfirmar = async (e) => {
    e.preventDefault();
    setProcesando(true);

    try {
      const resultado = await ApiService.confirmarCita(idCita, {
        estado: estadoResolucion,
        notasRecepcion: notasRecepcion.trim() || 'Confirmada en recepción.',
        horaConfirmacion: new Date().toISOString(),
        confirmadoPor: 'Recepción Dental Fine'
      });

      let jobCorreo = null;
      if (enviarCorreoAsync && estadoResolucion === 'FINALIZADA') {
        jobCorreo = EmailQueueService.encolarCorreo({
          plantillaId: 'RESUMEN_ATENCION',
          prioridad: 'ALTA',
          variables: {
            paciente: nombrePaciente,
            correo: correoPaciente,
            dentista: nombreDentista,
            servicio: nombreServicio,
            fecha: fechaStr,
            hora: `${horaStr} hrs`,
            clinica: 'Dental Fine - Clínica Central',
            folio: `#DF-${idCita}`,
            notas: notasRecepcion.trim() || 'Consulta finalizada satisfactoriamente.'
          }
        });
      }

      setConfirmadoExito(true);
      setTimeout(() => {
        setProcesando(false);
        if (onConfirmado) {
          onConfirmado({
            ...resultado,
            jobCorreo
          });
        }
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error al confirmar cita:', err);
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100">
        {/* CABECERA */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Confirmar Cita
              </h2>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                Registra la asistencia del paciente y el cierre de la consulta.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={procesando}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* CUERPO */}
        <div className="overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {confirmadoExito ? (
            <div className="py-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                ¡Cita Confirmada!
              </h3>
              <p className="text-slate-500 text-sm max-w-sm">
                La cita de <span className="font-bold text-slate-800">{nombrePaciente}</span> quedó registrada como{' '}
                <span className="font-black text-emerald-600">{estadoResolucion}</span>.
              </p>
            </div>
          ) : (
            <form id="confirmarCitaForm" onSubmit={handleConfirmar} className="space-y-6">
              {/* RESUMEN DE LA CITA */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600">
                    Folio Cita #{idCita}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-black text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                    <Calendar size={13} className="text-indigo-600" />
                    <span>{fechaStr}</span>
                    <span className="text-slate-300">|</span>
                    <Clock size={13} className="text-indigo-600" />
                    <span>{horaStr} hrs</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-start gap-2.5">
                    <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paciente</p>
                      <p className="text-sm font-bold text-slate-900">{nombrePaciente}</p>
                      <p className="text-[11px] text-slate-500 truncate">{correoPaciente}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Stethoscope size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Especialista y Servicio</p>
                      <p className="text-sm font-bold text-slate-900">{nombreDentista}</p>
                      <p className="text-[11px] text-indigo-600 font-semibold">{nombreServicio}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TIPO DE RESOLUCIÓN */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  Estado de Asistencia *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEstadoResolucion('FINALIZADA');
                      setNotasRecepcion('Paciente asistió puntualmente. Consulta concluida.');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      estadoResolucion === 'FINALIZADA'
                        ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2
                      size={20}
                      className={estadoResolucion === 'FINALIZADA' ? 'text-emerald-600 shrink-0 mt-0.5' : 'text-slate-400 shrink-0 mt-0.5'}
                    />
                    <div>
                      <p className="text-sm font-black text-slate-900">Asistencia Confirmada</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        El paciente asistió y la consulta fue realizada.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEstadoResolucion('INASISTENCIA');
                      setNotasRecepcion('El paciente no se presentó a la cita programada.');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      estadoResolucion === 'INASISTENCIA'
                        ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <AlertTriangle
                      size={20}
                      className={estadoResolucion === 'INASISTENCIA' ? 'text-amber-600 shrink-0 mt-0.5' : 'text-slate-400 shrink-0 mt-0.5'}
                    />
                    <div>
                      <p className="text-sm font-black text-slate-900">Inasistencia</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        El paciente no acudió a su cita programada.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* OBSERVACIONES DE RECEPCIÓN */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-indigo-600" />
                  Observaciones (Opcional)
                </label>
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {notasRapidas.map((sugerencia, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNotasRecepcion(sugerencia)}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer"
                    >
                      + {sugerencia}
                    </button>
                  ))}
                </div>
                <textarea
                  rows="3"
                  value={notasRecepcion}
                  onChange={(e) => setNotasRecepcion(e.target.value)}
                  placeholder="Notas sobre la consulta o asistencia del paciente..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* NOTIFICACIÓN POR CORREO */}
              {estadoResolucion === 'FINALIZADA' && (
                <label className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 cursor-pointer hover:bg-indigo-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={enviarCorreoAsync}
                    onChange={(e) => setEnviarCorreoAsync(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950">
                      <Mail size={14} className="text-indigo-600" />
                      Enviar comprobante de atención por correo
                    </div>
                    <p className="text-[11px] text-indigo-700/80 mt-0.5">
                      Se enviará automáticamente el resumen de la consulta a <span className="font-bold">{correoPaciente}</span>.
                    </p>
                  </div>
                </label>
              )}
            </form>
          )}
        </div>

        {/* PIE DEL MODAL */}
        {!confirmadoExito && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 mt-auto sticky bottom-0 z-10">
            <button
              type="button"
              onClick={onClose}
              disabled={procesando}
              className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              form="confirmarCitaForm"
              type="submit"
              disabled={procesando}
              className="flex-1 flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 text-sm transition-all active:scale-95 cursor-pointer"
            >
              {procesando ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} /> Confirmar
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
