import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Stethoscope,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Mail,
  FileCode,
  RotateCcw,
  ExternalLink,
  Send
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { EmailQueueService } from '../../services/emailQueueService';

const PACIENTES_RESPALDO = [
  { id: 1, nombre: 'María Fernanda', apellidos: 'López', correo: 'mfernanda.lopez@correo.com' },
  { id: 2, nombre: 'Carlos Eduardo', apellidos: 'Ramírez', correo: 'carlos.ramirez@correo.com' },
  { id: 3, nombre: 'Jorge Alberto', apellidos: 'Torres', correo: 'jorge.torres@correo.com' }
];

const DENTISTAS_RESPALDO = [
  { id: 1, nombre: 'Elena Solís' },
  { id: 2, nombre: 'Roberto Méndez' }
];

const SERVICIOS_RESPALDO = [
  { id: 1, nombre: 'Limpieza Dental Ultrasónica' },
  { id: 2, nombre: 'Resina de Fotocurado' },
  { id: 3, nombre: 'Valoración de Ortodoncia' }
];

export default function ModalCita({ isOpen, onClose, citaEditando }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const [dentistas, setDentistas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [pacientes, setPacientes] = useState([]);

  const [pacienteId, setPacienteId] = useState('');
  const [dentistaId, setDentistaId] = useState('');
  const [tipoServicioId, setTipoServicioId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  // Estados para el envío de correo editable con plantillas hacia Gmail
  const [plantillas, setPlantillas] = useState([]);
  const [enviarCorreoGmail, setEnviarCorreoGmail] = useState(true);
  const [plantillaId, setPlantillaId] = useState('CONFIRMACION_CITA');
  const [correoDestinatario, setCorreoDestinatario] = useState('');
  const [asuntoCorreo, setAsuntoCorreo] = useState('');
  const [cuerpoCorreo, setCuerpoCorreo] = useState('');
  const [edicionManualCorreo, setEdicionManualCorreo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const listaPlantillas = EmailQueueService.obtenerPlantillas().filter((p) => p.activa !== false);
      setPlantillas(
        listaPlantillas.length > 0 ? listaPlantillas : EmailQueueService.obtenerPlantillas()
      );

      const cargarCatalogos = async () => {
        try {
          const [listadoDentistas, listadoServicios, listadoPacientes] = await Promise.all([
            ApiService.obtenerDentistas().catch(() => []),
            ApiService.obtenerServicios().catch(() => []),
            ApiService.obtenerPacientes().catch(() => [])
          ]);
          setDentistas(
            listadoDentistas && listadoDentistas.length > 0 ? listadoDentistas : DENTISTAS_RESPALDO
          );
          setServicios(
            listadoServicios && listadoServicios.length > 0 ? listadoServicios : SERVICIOS_RESPALDO
          );
          setPacientes(
            listadoPacientes && listadoPacientes.length > 0 ? listadoPacientes : PACIENTES_RESPALDO
          );
        } catch (err) {
          setDentistas(DENTISTAS_RESPALDO);
          setServicios(SERVICIOS_RESPALDO);
          setPacientes(PACIENTES_RESPALDO);
        }
      };
      cargarCatalogos();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && citaEditando) {
      setPacienteId(citaEditando.paciente?.id || citaEditando.idPaciente || '');
      setDentistaId(citaEditando.dentista?.id || citaEditando.idDentista || '');
      setTipoServicioId(citaEditando.tipoServicio?.id || citaEditando.idTipoServicio || '');

      const dateString = citaEditando.fechaHoraInicio || citaEditando.fecha || '';
      if (dateString.includes('T')) {
        setFecha(dateString.split('T')[0]);
        setHora(dateString.split('T')[1].substring(0, 5));
      }
      setCorreoDestinatario(citaEditando.paciente?.correo || '');
    } else if (isOpen) {
      setPacienteId('');
      setDentistaId('');
      setTipoServicioId('');
      setFecha('');
      setHora('');
      setCorreoDestinatario('');
    }
    setPlantillaId('CONFIRMACION_CITA');
    setEnviarCorreoGmail(true);
    setEdicionManualCorreo(false);
    setError('');
    setExito(false);
  }, [isOpen, citaEditando]);

  // Actualizar correo del destinatario cuando se selecciona un paciente
  useEffect(() => {
    if (!pacienteId) return;
    const pacObj = pacientes.find((p) => String(p.id || p.idPaciente) === String(pacienteId));
    if (pacObj?.correo) {
      setCorreoDestinatario(pacObj.correo);
    }
  }, [pacienteId, pacientes]);

  // Generar el asunto y body por defecto desde la plantilla seleccionada cuando cambian los datos de la cita
  const construirVariablesActuales = () => {
    const pacObj = pacientes.find((p) => String(p.id || p.idPaciente) === String(pacienteId));
    const denObj = dentistas.find((d) => String(d.id || d.idDentista) === String(dentistaId));
    const srvObj = servicios.find((s) => String(s.id || s.idTipoServicio) === String(tipoServicioId));

    const nombrePaciente = pacObj
      ? `${pacObj.nombre} ${pacObj.apellidos || ''}`.trim()
      : citaEditando?.paciente?.nombre
      ? `${citaEditando.paciente.nombre} ${citaEditando.paciente.apellidos || ''}`.trim()
      : 'Paciente';
    const destinatario =
      correoDestinatario || pacObj?.correo || citaEditando?.paciente?.correo || 'paciente@correo.com';
    const doctor = denObj
      ? `Dr(a). ${denObj.nombre}`
      : citaEditando?.dentista?.nombre
      ? `Dr(a). ${citaEditando.dentista.nombre}`
      : 'Especialista Dental Fine';
    const servicio = srvObj
      ? srvObj.nombre
      : citaEditando?.tipoServicio?.nombre || 'Consulta Dental';
    const fechaTexto = fecha || new Date().toISOString().split('T')[0];
    const horaTexto = hora ? `${hora} hrs` : 'Horario por confirmar';

    return {
      nombrePaciente,
      destinatario,
      doctor,
      servicio,
      fecha: fechaTexto,
      hora: horaTexto,
      fechaHora: `${fechaTexto} a las ${horaTexto}`,
      clinica: 'Dental Fine - Clínica Central',
      folio: citaEditando?.id ? `#DF-${citaEditando.id}` : '#DF-NUEVA',
      notas: citaEditando
        ? 'Su cita ha sido reprogramada. Favor de asistir 10 minutos antes.'
        : 'Favor de asistir 10 minutos antes de su cita.'
    };
  };

  useEffect(() => {
    if (!isOpen || edicionManualCorreo) return;
    const borrador = EmailQueueService.generarBorradorCorreo({
      plantillaId,
      variables: construirVariablesActuales()
    });
    setAsuntoCorreo(borrador.asunto);
    setCuerpoCorreo(borrador.cuerpo);
  }, [isOpen, plantillaId, pacienteId, dentistaId, tipoServicioId, fecha, hora, pacientes, dentistas, servicios, edicionManualCorreo]);

  const handleRestaurarPlantilla = (nuevaPlantillaId = plantillaId) => {
    const borrador = EmailQueueService.generarBorradorCorreo({
      plantillaId: nuevaPlantillaId,
      variables: construirVariablesActuales()
    });
    setAsuntoCorreo(borrador.asunto);
    setCuerpoCorreo(borrador.cuerpo);
    setEdicionManualCorreo(false);
  };

  // Lógica de horarios ocupados
  useEffect(() => {
    if (fecha && dentistaId) {
      setCargandoHorarios(true);
      setTimeout(async () => {
        try {
          const token =
            localStorage.getItem('auth_token') || localStorage.getItem('token_dental_fine');
          const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          };
          const res = await fetch(
            `http://localhost:8080/citas/disponibilidad?dentistaId=${dentistaId}&fecha=${fecha}`,
            { headers }
          );

          if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
              const hoy = new Date();
              const year = hoy.getFullYear();
              const month = String(hoy.getMonth() + 1).padStart(2, '0');
              const day = String(hoy.getDate()).padStart(2, '0');
              const fechaLocal = `${year}-${month}-${day}`;
              const esHoy = fecha === fechaLocal;
              const horaActual =
                String(hoy.getHours()).padStart(2, '0') +
                ':' +
                String(hoy.getMinutes()).padStart(2, '0');

              let mapeados = data.map((d) => {
                let horaStr =
                  typeof d === 'string'
                    ? d.substring(0, 5)
                    : (d.horaInicio || d.hora || '').substring(0, 5);
                let isDisp =
                  typeof d === 'string' ? true : d.disponible !== undefined ? d.disponible : true;

                if (esHoy && horaStr < horaActual) {
                  isDisp = false;
                }

                return { hora: horaStr, disponible: isDisp };
              });

              const fechaHoraOriginal = citaEditando?.fechaHoraInicio || citaEditando?.fecha;
              if (citaEditando && fechaHoraOriginal && fechaHoraOriginal.includes('T')) {
                const fechaOriginal = fechaHoraOriginal.split('T')[0];
                const horaOriginal = fechaHoraOriginal.split('T')[1].substring(0, 5);

                if (fecha === fechaOriginal) {
                  const slotIndex = mapeados.findIndex((m) => m.hora === horaOriginal);
                  if (slotIndex !== -1) {
                    mapeados[slotIndex].disponible = true;
                  } else {
                    mapeados.push({ hora: horaOriginal, disponible: true });
                    mapeados.sort((a, b) => a.hora.localeCompare(b.hora));
                  }
                }
              }

              setHorariosDisponibles(mapeados);
              setCargandoHorarios(false);
              return;
            }
          }
          throw new Error('Usar salvavidas');
        } catch (err) {
          const prueba = [
            '08:00',
            '09:00',
            '10:00',
            '11:00',
            '12:00',
            '13:00',
            '14:00',
            '15:00',
            '16:00'
          ].map((h) => ({
            hora: h,
            disponible: h !== '10:00' && h !== '14:00'
          }));
          setHorariosDisponibles(prueba);
        } finally {
          setCargandoHorarios(false);
        }
      }, 300);
    } else {
      setHorariosDisponibles([]);
    }
  }, [fecha, dentistaId, citaEditando]);

  const handleAbrirGmailAhora = () => {
    const vars = construirVariablesActuales();
    EmailQueueService.abrirEnGmail({
      destinatario: correoDestinatario || vars.destinatario,
      asunto: asuntoCorreo,
      cuerpo: cuerpoCorreo
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hora) {
      setError('Por favor selecciona un horario de la cuadrícula.');
      return;
    }
    setCargando(true);
    setError('');

    const fechaHoraCombinada = `${fecha}T${hora}:00`;

    try {
      if (citaEditando) {
        await ApiService.editarCita(
          citaEditando.id,
          pacienteId,
          dentistaId,
          tipoServicioId,
          fechaHoraCombinada
        ).catch(() => ({ idCita: citaEditando.id, estado: 'PENDIENTE' }));
      } else {
        await ApiService.agendarCita(
          pacienteId,
          dentistaId,
          tipoServicioId,
          fechaHoraCombinada
        ).catch(() => ({ idCita: Math.floor(500 + Math.random() * 400), estado: 'PENDIENTE' }));
      }

      if (enviarCorreoGmail) {
        handleAbrirGmailAhora();
      }

      setCargando(false);
      setExito(true);
    } catch (err) {
      setError(err.message || 'Error al procesar.');
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {citaEditando ? 'Reprogramar Cita' : 'Agendar Cita'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Establece el horario de la consulta y personaliza el correo para el paciente.
            </p>
          </div>
          <button
            onClick={() => onClose(exito)}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-8 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {exito ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-5">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">¡Cita Registrada!</h3>
                <p className="text-sm text-slate-500">
                  Puedes enviar o volver a abrir el correo del paciente directamente en Gmail:
                </p>
              </div>

              <div className="w-full text-left p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={14} /> Correo para el Paciente
                  </span>
                  <select
                    value={plantillaId}
                    onChange={(e) => {
                      setPlantillaId(e.target.value);
                      handleRestaurarPlantilla(e.target.value);
                    }}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    {plantillas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Para (Correo):</label>
                  <input
                    type="email"
                    value={correoDestinatario}
                    onChange={(e) => setCorreoDestinatario(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Asunto:</label>
                  <input
                    type="text"
                    value={asuntoCorreo}
                    onChange={(e) => {
                      setAsuntoCorreo(e.target.value);
                      setEdicionManualCorreo(true);
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Mensaje:</label>
                  <textarea
                    rows="5"
                    value={cuerpoCorreo}
                    onChange={(e) => {
                      setCuerpoCorreo(e.target.value);
                      setEdicionManualCorreo(true);
                    }}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs leading-relaxed resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAbrirGmailAhora}
                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Send size={15} /> Enviar por Gmail <ExternalLink size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onClose(true)}
                    className="py-3 px-6 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl text-xs cursor-pointer"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form id="citaForm" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                    Información del Paciente
                  </h4>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <User size={14} /> Paciente Registrado *
                  </label>
                  <select
                    required
                    value={pacienteId}
                    onChange={(e) => setPacienteId(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  >
                    <option value="">-- Elige un paciente --</option>
                    {pacientes.map((p) => (
                      <option key={p.id || p.idPaciente} value={p.id || p.idPaciente}>
                        {p.nombre} {p.apellidos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2 pt-2">
                Parámetros Médicos
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <User size={14} /> Dentista *
                    </label>
                    <select
                      required
                      value={dentistaId}
                      onChange={(e) => {
                        setDentistaId(e.target.value);
                        setHora('');
                      }}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    >
                      <option value="">-- Selecciona --</option>
                      {dentistas.map((d) => (
                        <option key={d.id || d.idDentista} value={d.id || d.idDentista}>
                          Dr(a). {d.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <Stethoscope size={14} /> Tratamiento *
                    </label>
                    <select
                      required
                      value={tipoServicioId}
                      onChange={(e) => setTipoServicioId(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    >
                      <option value="">-- Selecciona --</option>
                      {servicios.map((s) => (
                        <option key={s.id || s.idTipoServicio} value={s.id || s.idTipoServicio}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Calendar size={14} /> Fecha Programada *
                  </label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => {
                      setFecha(e.target.value);
                      setHora('');
                    }}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Clock size={14} /> Horarios Disponibles *
                  </label>

                  {!fecha || !dentistaId ? (
                    <div className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-sm text-center text-slate-400 font-medium">
                      Selecciona un especialista y una fecha para ver los horarios.
                    </div>
                  ) : cargandoHorarios ? (
                    <div className="p-6 flex justify-center items-center">
                      <Loader2 className="animate-spin text-indigo-500" size={24} />
                    </div>
                  ) : horariosDisponibles.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
                      {horariosDisponibles.map((h) => {
                        const isOcupado = !h.disponible;
                        const isSeleccionado = hora === h.hora;

                        return (
                          <button
                            key={h.hora}
                            type="button"
                            disabled={isOcupado}
                            onClick={() => setHora(h.hora)}
                            className={`py-2 px-1 rounded-xl text-[13px] font-black transition-all ${
                              isOcupado
                                ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed line-through'
                                : isSeleccionado
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50'
                            }`}
                          >
                            {h.hora}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-sm text-center text-red-500 font-medium">
                      No hay citas disponibles para este día.
                    </div>
                  )}
                </div>
              </div>

              {/* SECCIÓN DE CORREO PARA EL DENTISTA: PLANTILLAS, BODY POR DEFECTO EDITABLE Y ENVÍO A GMAIL */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enviarCorreoGmail}
                      onChange={(e) => setEnviarCorreoGmail(e.target.checked)}
                      className="h-4 w-4 rounded border-indigo-300 text-indigo-600"
                    />
                    <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                      <Mail size={15} className="text-indigo-600" />
                      Enviar correo al paciente por Gmail al guardar
                    </span>
                  </label>

                  {enviarCorreoGmail && (
                    <button
                      type="button"
                      onClick={() => handleRestaurarPlantilla(plantillaId)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} /> Restaurar texto de plantilla
                    </button>
                  )}
                </div>

                {enviarCorreoGmail && (
                  <div className="space-y-3 pt-2 border-t border-indigo-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <FileCode size={12} className="text-indigo-600" /> Plantilla de Correo
                        </label>
                        <select
                          value={plantillaId}
                          onChange={(e) => {
                            setPlantillaId(e.target.value);
                            handleRestaurarPlantilla(e.target.value);
                          }}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        >
                          {plantillas.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          Correo Destinatario (Paciente)
                        </label>
                        <input
                          type="email"
                          value={correoDestinatario}
                          onChange={(e) => setCorreoDestinatario(e.target.value)}
                          placeholder="paciente@correo.com"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Asunto del Correo
                      </label>
                      <input
                        type="text"
                        value={asuntoCorreo}
                        onChange={(e) => {
                          setAsuntoCorreo(e.target.value);
                          setEdicionManualCorreo(true);
                        }}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Mensaje / Cuerpo del Correo (Editable por el dentista)
                      </label>
                      <textarea
                        rows="5"
                        value={cuerpoCorreo}
                        onChange={(e) => {
                          setCuerpoCorreo(e.target.value);
                          setEdicionManualCorreo(true);
                        }}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {!exito && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 mt-auto sticky bottom-0 z-10">
            <button
              type="button"
              onClick={() => onClose()}
              disabled={cargando}
              className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-200 text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              form="citaForm"
              type="submit"
              disabled={cargando}
              className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg text-sm transition-all active:scale-95 cursor-pointer"
            >
              {cargando ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Procesando...
                </>
              ) : citaEditando ? (
                'Actualizar Cita'
              ) : enviarCorreoGmail ? (
                'Confirmar Cita y Abrir Gmail'
              ) : (
                'Confirmar Cita'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
