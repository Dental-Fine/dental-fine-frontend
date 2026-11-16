import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, User, Stethoscope, 
  AlertCircle, Loader2, CheckCircle2, Save, ArrowRight
} from 'lucide-react';
import { ApiService } from '../../services/api';

/**
 * HU04-T01: Modal de edición de cita en React con carga dinámica de catálogos.
 * Permite a recepción editar el dentista, servicio u horario de una cita existente,
 * liberando el horario anterior y reservando el nuevo sin recargar la página.
 * 
 * Se acopla al endpoint HU04-T02: PUT /api/citas/{id}
 */
export const ModalEdicionCita = ({ isOpen, onClose, cita, onCitaActualizada }) => {
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  // Catálogos cargados dinámicamente
  const [dentistas, setDentistas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [pacientes, setPacientes] = useState([]);

  // Estados del formulario
  const [pacienteId, setPacienteId] = useState('');
  const [dentistaId, setDentistaId] = useState('');
  const [tipoServicioId, setTipoServicioId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  // Datos originales de la cita para comparar cambios y liberar horario
  const [datosOriginales, setDatosOriginales] = useState(null);

  // 1. Carga Dinámica de Catálogos al abrir el modal (Dentistas, Servicios, Pacientes)
  useEffect(() => {
    if (isOpen) {
      const cargarCatalogos = async () => {
        setCargandoCatalogos(true);
        setError('');
        try {
          const [listadoDentistas, listadoServicios, listadoPacientes] = await Promise.all([
            ApiService.obtenerDentistas(),
            ApiService.obtenerServicios(),
            ApiService.obtenerPacientes()
          ]);
          setDentistas(listadoDentistas || []);
          setServicios(listadoServicios || []);
          setPacientes(listadoPacientes || []);
        } catch (err) {
          console.error("Error al cargar catálogos dinámicos:", err);
          setError("No se pudieron cargar todos los catálogos del servidor.");
        } finally {
          setCargandoCatalogos(false);
        }
      };
      cargarCatalogos();
    }
  }, [isOpen]);

  // 2. Inicializar los valores del formulario cuando se recibe la cita a editar
  useEffect(() => {
    if (isOpen && cita) {
      const pId = cita.paciente?.id || cita.pacienteId || cita.idPaciente || '';
      const dId = cita.dentista?.id || cita.dentistaId || cita.idDentista || '';
      const sId = cita.tipoServicio?.id || cita.tipoServicioId || cita.idTipoServicio || cita.servicioId || '';

      let f = '';
      let h = '';
      const dateStr = cita.fechaHoraInicio || cita.fecha || '';
      if (dateStr.includes('T')) {
        f = dateStr.split('T')[0];
        h = dateStr.split('T')[1].substring(0, 5);
      }

      setPacienteId(String(pId));
      setDentistaId(String(dId));
      setTipoServicioId(String(sId));
      setFecha(f);
      setHora(h);

      setDatosOriginales({
        pacienteId: String(pId),
        dentistaId: String(dId),
        tipoServicioId: String(sId),
        fecha: f,
        hora: h
      });

      setError('');
      setExito(false);
    }
  }, [isOpen, cita]);

  // 3. Carga Dinámica de Horarios Disponibles según Dentista y Fecha seleccionados
  useEffect(() => {
    if (isOpen && fecha && dentistaId) {
      let isSubscribed = true;
      setCargandoHorarios(true);

      const consultarDisponibilidad = async () => {
        try {
          const data = await ApiService.obtenerDisponibilidad(dentistaId, fecha);

          if (!isSubscribed) return;

          // Cálculo para deshabilitar horas pasadas si la cita es para hoy
          const hoy = new Date();
          const year = hoy.getFullYear();
          const month = String(hoy.getMonth() + 1).padStart(2, '0');
          const day = String(hoy.getDate()).padStart(2, '0');
          const fechaLocalHoy = `${year}-${month}-${day}`;
          const esHoy = fecha === fechaLocalHoy;
          const horaActual = String(hoy.getHours()).padStart(2, '0') + ':' + String(hoy.getMinutes()).padStart(2, '0');

          let slots = (data || []).map(item => {
            let horaStr = typeof item === 'string' ? item.substring(0, 5) : (item.horaInicio || item.hora || '').substring(0, 5);
            let disponible = typeof item === 'string' ? true : (item.disponible !== undefined ? item.disponible : true);

            // Si es hoy y ya pasó la hora, se marca no disponible
            if (esHoy && horaStr < horaActual) {
              disponible = false;
            }

            return { hora: horaStr, disponible };
          });

          // Si el backend no devolvió slots (o fallback local), usamos la cuadrícula estándar de la clínica
          if (slots.length === 0) {
            const horarioClinica = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
            slots = horarioClinica.map(hStr => ({
              hora: hStr,
              disponible: !(esHoy && hStr < horaActual)
            }));
          }

          // REGLA CLÍNICA DE REAGENDAMIENTO:
          // Si el usuario está editando la misma cita en la misma fecha y con el mismo dentista,
          // su propio horario actual debe figurar como disponible (no debe autobloquearse).
          if (datosOriginales && datosOriginales.fecha === fecha && datosOriginales.dentistaId === String(dentistaId)) {
            const idx = slots.findIndex(s => s.hora === datosOriginales.hora);
            if (idx !== -1) {
              slots[idx].disponible = true;
            } else if (datosOriginales.hora) {
              slots.push({ hora: datosOriginales.hora, disponible: true });
              slots.sort((a, b) => a.hora.localeCompare(b.hora));
            }
          }

          setHorariosDisponibles(slots);
        } catch (err) {
          console.warn("Fallo al consultar disponibilidad, aplicando horarios base:", err);
          const fallback = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map(h => ({
            hora: h,
            disponible: true
          }));
          setHorariosDisponibles(fallback);
        } finally {
          if (isSubscribed) setCargandoHorarios(false);
        }
      };

      consultarDisponibilidad();

      return () => { isSubscribed = false; };
    } else {
      setHorariosDisponibles([]);
    }
  }, [isOpen, fecha, dentistaId, datosOriginales]);

  // 4. Procesar el envío de la modificación al Backend (PUT /api/citas/{id})
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hora) {
      setError('Por favor selecciona un horario de la cuadrícula.');
      return;
    }
    if (!dentistaId) {
      setError('Debes seleccionar un especialista.');
      return;
    }

    setGuardando(true);
    setError('');

    const fechaHoraCombinada = `${fecha}T${hora}:00`;
    const citaId = cita?.id || cita?.idCita;

    try {
      // HU04-T02: Llamada al endpoint PUT /api/citas/{id}
      await ApiService.editarCita(
        citaId,
        pacienteId,
        dentistaId,
        tipoServicioId,
        fechaHoraCombinada
      );

      // Objeto de la cita actualizado para refrescar la tarjeta en recepción sin recargar página
      const dentistaObj = dentistas.find(d => String(d.id || d.idDentista) === String(dentistaId));
      const servicioObj = servicios.find(s => String(s.id || s.idTipoServicio) === String(tipoServicioId));
      const pacienteObj = pacientes.find(p => String(p.id || p.idPaciente) === String(pacienteId));

      const citaActualizada = {
        ...cita,
        id: citaId,
        idCita: citaId,
        paciente: pacienteObj || cita?.paciente,
        pacienteId: pacienteId,
        idPaciente: pacienteId,
        nombrePaciente: pacienteObj ? `${pacienteObj.nombre} ${pacienteObj.apellidos || ''}`.trim() : (cita?.nombrePaciente || 'Paciente'),
        dentista: dentistaObj || cita?.dentista,
        dentistaId: dentistaId,
        idDentista: dentistaId,
        nombreDentista: dentistaObj ? dentistaObj.nombre : (cita?.nombreDentista || 'Dentista'),
        tipoServicio: servicioObj || cita?.tipoServicio,
        tipoServicioId: tipoServicioId,
        idTipoServicio: tipoServicioId,
        nombreServicio: servicioObj ? servicioObj.nombre : (cita?.nombreServicio || 'Servicio General'),
        fecha: fechaHoraCombinada,
        fechaHoraInicio: fechaHoraCombinada
      };

      setExito(true);

      // Esperar feedback visual y notificar al componente padre
      setTimeout(() => {
        setExito(false);
        if (onCitaActualizada) {
          onCitaActualizada(citaActualizada);
        }
        onClose({ actualizada: true, citaActualizada });
      }, 1200);

    } catch (err) {
      console.error("Error al actualizar cita:", err);
      setError(err.message || 'Error al actualizar los parámetros de la cita.');
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) return null;

  const pacienteSeleccionado = pacientes.find(p => String(p.id || p.idPaciente) === String(pacienteId)) || cita?.paciente;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100 animate-in zoom-in-95">
        
        {/* Cabecera del Modal */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700">
                HU-04 • Recepción
              </span>
              <span className="text-xs font-bold text-slate-400">Cita #{cita?.id || cita?.idCita}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Modificar y Reagendar Cita</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Edita el especialista, tratamiento u horario. Los cambios liberarán el espacio anterior.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => onClose(false)} 
            disabled={guardando}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Contenido / Formulario */}
        <div className="overflow-y-auto p-8 custom-scrollbar space-y-6">
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100 text-sm font-bold animate-in shake">
              <AlertCircle size={20} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {exito ? (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">¡Cita Modificada con Éxito!</h3>
              <p className="text-sm font-medium text-slate-500">
                El espacio anterior fue liberado y la agenda ha sido actualizada.
              </p>
            </div>
          ) : (
            <form id="edicionCitaForm" onSubmit={handleSubmit} className="space-y-6">

              {/* Paciente (Informativo / Ficha) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Paciente de la Consulta
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm">
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      {pacienteSeleccionado?.nombre} {pacienteSeleccionado?.apellidos || ''}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      Tel: {pacienteSeleccionado?.telefono || 'N/A'} • {pacienteSeleccionado?.correo || 'Sin correo'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Catálogo 1: Especialista / Dentista */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User size={14} className="text-indigo-600" /> Especialista Asignado *
                  </span>
                  {cargandoCatalogos && <span className="text-[10px] text-slate-400 font-normal">Cargando dentistas...</span>}
                </label>
                <select
                  required
                  value={dentistaId}
                  onChange={e => {
                    setDentistaId(e.target.value);
                    setHora(''); // Reiniciar hora al cambiar especialista
                  }}
                  disabled={cargandoCatalogos || guardando}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-600 transition-colors"
                >
                  <option value="">-- Selecciona un especialista --</option>
                  {dentistas.map(d => (
                    <option key={d.id || d.idDentista} value={d.id || d.idDentista}>
                      Dr(a). {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Catálogo 2: Tipo de Servicio / Tratamiento */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Stethoscope size={14} className="text-indigo-600" /> Servicio o Tratamiento *
                  </span>
                  {cargandoCatalogos && <span className="text-[10px] text-slate-400 font-normal">Cargando servicios...</span>}
                </label>
                <select
                  required
                  value={tipoServicioId}
                  onChange={e => setTipoServicioId(e.target.value)}
                  disabled={cargandoCatalogos || guardando}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-600 transition-colors"
                >
                  <option value="">-- Selecciona un servicio --</option>
                  {servicios.map(s => (
                    <option key={s.id || s.idTipoServicio} value={s.id || s.idTipoServicio}>
                      {s.nombre} {s.monto ? `• $${s.monto}` : ''} {s.tiempoMinutos ? `(${s.tiempoMinutos} min)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selección de Fecha */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <Calendar size={14} className="text-indigo-600" /> Nueva Fecha Programada *
                </label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={e => {
                    setFecha(e.target.value);
                    setHora(''); // Reiniciar hora al cambiar fecha
                  }}
                  disabled={guardando}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              {/* Catálogo Dinámico 3: Cuadrícula de Horarios Disponibles */}
              <div className="space-y-2 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    <Clock size={14} className="text-indigo-600" /> Horarios de Atención Disponibles *
                  </label>
                  {hora && (
                    <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                      Seleccionado: {hora}
                    </span>
                  )}
                </div>

                {!fecha || !dentistaId ? (
                  <div className="p-6 bg-white border border-slate-200 border-dashed rounded-xl text-xs text-center text-slate-400 font-bold">
                    Elige primero el especialista y la fecha para consultar la disponibilidad en tiempo real.
                  </div>
                ) : cargandoHorarios ? (
                  <div className="p-6 flex flex-col justify-center items-center gap-2 text-indigo-600">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="text-xs font-bold text-slate-400">Consultando agenda del especialista...</span>
                  </div>
                ) : horariosDisponibles.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                      {horariosDisponibles.map(slot => {
                        const isOcupado = !slot.disponible;
                        const isSeleccionado = hora === slot.hora;
                        const esHorarioActual = datosOriginales?.hora === slot.hora && datosOriginales?.fecha === fecha;

                        return (
                          <button
                            key={slot.hora}
                            type="button"
                            disabled={isOcupado || guardando}
                            onClick={() => setHora(slot.hora)}
                            className={`py-2.5 px-1 rounded-xl text-xs font-black transition-all relative ${
                              isOcupado
                                ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed line-through'
                                : isSeleccionado
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer'
                            }`}
                            title={isOcupado ? 'Horario ocupado' : esHorarioActual ? 'Horario original de la cita' : 'Disponible'}
                          >
                            {slot.hora}
                            {esHorarioActual && !isSeleccionado && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" title="Horario actual" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 mt-3 pt-2 border-t border-slate-200">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-white border border-slate-300 inline-block"></span> Disponible
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-slate-200 border border-slate-300 inline-block"></span> Ocupado
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Tu horario original
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-white border border-slate-200 border-dashed rounded-xl text-xs text-center text-red-500 font-bold">
                    No hay horarios disponibles para la fecha seleccionada.
                  </div>
                )}
              </div>

            </form>
          )}

        </div>

        {/* Botones de Acción */}
        {!exito && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 mt-auto sticky bottom-0 z-10">
            <button
              type="button"
              onClick={() => onClose(false)}
              disabled={guardando}
              className="flex-1 px-6 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              form="edicionCitaForm"
              type="submit"
              disabled={guardando || cargandoCatalogos}
              className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 text-sm transition-all active:scale-95 cursor-pointer"
            >
              {guardando ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Guardando en BD...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ModalEdicionCita;
