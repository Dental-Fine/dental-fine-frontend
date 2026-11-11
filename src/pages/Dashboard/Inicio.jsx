import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  Loader2,
  Edit2,
  Trash2,
  Stethoscope,
  Users,
  Activity,
  XCircle,
  CheckCircle2,
  Archive,
  RotateCcw,
  FileText,
  Search,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../services/api';
import ModalCita from '../../components/Modales/ModalCita';
import ModalConfirmacionCita from '../../components/Modales/ModalConfirmacionCita';
import { EmailQueueService } from '../../services/emailQueueService';

const ES_ESTADO_HISTORIAL = (estado) =>
  ['FINALIZADA', 'ATENDIDA', 'COMPLETADA', 'CANCELADA', 'INASISTENCIA'].includes(
    (estado || '').toUpperCase()
  );

export default function Inicio() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [totalDentistas, setTotalDentistas] = useState(0);
  const [cargando, setCargando] = useState(true);

  // Estados para el control del Calendario Visual
  const [mesMostrado, setMesMostrado] = useState(new Date());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  // Estados de Recepción: Pestaña Agenda Activa vs Historial (HU05-T02)
  const [pestanaRecepcion, setPestanaRecepcion] = useState('activas'); // 'activas' | 'historial'
  const [alcanceHistorial, setAlcanceHistorial] = useState('dia'); // 'dia' | 'todos'
  const [filtroEstadoHistorial, setFiltroEstadoHistorial] = useState('TODOS'); // 'TODOS' | 'FINALIZADA' | 'CANCELADA'
  const [busquedaHistorial, setBusquedaHistorial] = useState('');
  const [notificacionTraslado, setNotificacionTraslado] = useState(null);

  // Estados para controlar los modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [citaAEditar, setCitaAEditar] = useState(null);
  const [citaAConfirmar, setCitaAConfirmar] = useState(null);

  useEffect(() => {
    cargarTodasLasCitas();
  }, []);

  const formatoFechaLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 1. Consultar datos del Dashboard del Spring Boot (con respaldo local para pruebas de recepción)
  const cargarTodasLasCitas = async () => {
    setCargando(true);
    try {
      const [dataCitas, dataPacientes, dataDentistas] = await Promise.all([
        ApiService.obtenerCitas().catch(() => []),
        ApiService.obtenerPacientes().catch(() => []),
        ApiService.obtenerDentistas().catch(() => [])
      ]);

      const hoyStr = formatoFechaLocal(new Date());
      const historialLocal = ApiService.obtenerHistorialConfirmacionesLocal();

      if (dataCitas && dataCitas.length > 0) {
        setCitas(dataCitas);
      } else {
        // Si el backend no está encendido o no tiene citas aún, ofrecemos citas de demostración del día
        const mockCitasRecepcion = [
          {
            id: 501,
            fecha: `${hoyStr}T09:30:00`,
            estado: 'PENDIENTE',
            paciente: { id: 1, nombre: 'María Fernanda', apellidos: 'López', correo: 'mfernanda.lopez@correo.com' },
            dentista: { id: 1, nombre: 'Elena Solís' },
            tipoServicio: { id: 1, nombre: 'Limpieza Dental Ultrasónica' }
          },
          {
            id: 502,
            fecha: `${hoyStr}T11:00:00`,
            estado: 'PENDIENTE',
            paciente: { id: 2, nombre: 'Carlos Eduardo', apellidos: 'Ramírez', correo: 'carlos.ramirez@correo.com' },
            dentista: { id: 2, nombre: 'Roberto Méndez' },
            tipoServicio: { id: 2, nombre: 'Resina de Fotocurado' }
          },
          {
            id: 503,
            fecha: `${hoyStr}T13:00:00`,
            estado: 'FINALIZADA',
            notasRecepcion: 'Paciente asistió puntualmente. Consulta concluida y archivada.',
            horaConfirmacion: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            trasladadoAHistorial: true,
            paciente: { id: 3, nombre: 'Jorge Alberto', apellidos: 'Torres', correo: 'jorge.torres@correo.com' },
            dentista: { id: 1, nombre: 'Elena Solís' },
            tipoServicio: { id: 3, nombre: 'Valoración de Ortodoncia' }
          }
        ].map((c) => (historialLocal[String(c.id)] ? { ...c, ...historialLocal[String(c.id)] } : c));

        setCitas(mockCitasRecepcion);
      }

      setTotalPacientes(dataPacientes?.length || 3);
      setTotalDentistas(dataDentistas?.length || 2);
    } catch (err) {
      console.error('Error al sincronizar datos en Inicio:', err);
    } finally {
      setCargando(false);
    }
  };

  const strFechaSeleccionada = formatoFechaLocal(fechaSeleccionada);

  // 2. Separar citas del día entre Agenda Activa e Historial
  const citasDelDia = citas.filter((c) => c.fecha && c.fecha.startsWith(strFechaSeleccionada));

  const citasActivasDelDia = citasDelDia
    .filter((c) => !ES_ESTADO_HISTORIAL(c.estado))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const baseHistorial =
    alcanceHistorial === 'dia'
      ? citasDelDia.filter((c) => ES_ESTADO_HISTORIAL(c.estado))
      : citas.filter((c) => ES_ESTADO_HISTORIAL(c.estado));

  const citasHistorialFiltradas = baseHistorial
    .filter((c) => {
      if (filtroEstadoHistorial === 'FINALIZADA') {
        return ['FINALIZADA', 'ATENDIDA', 'COMPLETADA'].includes((c.estado || '').toUpperCase());
      }
      if (filtroEstadoHistorial === 'CANCELADA') {
        return ['CANCELADA', 'INASISTENCIA'].includes((c.estado || '').toUpperCase());
      }
      return true;
    })
    .filter((c) => {
      if (!busquedaHistorial.trim()) return true;
      const q = busquedaHistorial.toLowerCase();
      const pac = `${c.paciente?.nombre || ''} ${c.paciente?.apellidos || ''} ${c.nombrePaciente || ''}`.toLowerCase();
      const doc = `${c.dentista?.nombre || ''} ${c.nombreDentista || ''}`.toLowerCase();
      const serv = `${c.tipoServicio?.nombre || ''}`.toLowerCase();
      return pac.includes(q) || doc.includes(q) || serv.includes(q) || String(c.id || c.idCita).includes(q);
    })
    .sort((a, b) => new Date(b.horaConfirmacion || b.fecha) - new Date(a.horaConfirmacion || a.fecha));

  const abrirModalNuevaCita = () => {
    setCitaAEditar(null);
    setIsModalOpen(true);
  };

  const abrirModalEditarCita = (cita) => {
    setCitaAEditar(cita);
    setIsModalOpen(true);
  };

  const abrirModalConfirmarCita = (cita) => {
    setCitaAConfirmar(cita);
  };

  const handleCitaConfirmada = (resultadoConfirmacion) => {
    const idConfirmada = resultadoConfirmacion.id;
    setCitas((prev) =>
      prev.map((c) => {
        const idActual = c.id || c.idCita;
        if (String(idActual) === String(idConfirmada)) {
          return {
            ...c,
            estado: resultadoConfirmacion.estado,
            notasRecepcion: resultadoConfirmacion.notasRecepcion,
            horaConfirmacion: resultadoConfirmacion.horaConfirmacion,
            trasladadoAHistorial: true
          };
        }
        return c;
      })
    );

    setNotificacionTraslado({
      id: idConfirmada,
      estado: resultadoConfirmacion.estado,
      jobCorreo: resultadoConfirmacion.jobCorreo
    });

    setTimeout(() => {
      setNotificacionTraslado((actual) => (actual?.id === idConfirmada ? null : actual));
    }, 6500);
  };

  const handleRestaurarCitaAAgenda = async (cita) => {
    const idReal = cita.id || cita.idCita;
    await ApiService.revertirCitaAAgenda(idReal);
    setCitas((prev) =>
      prev.map((c) =>
        String(c.id || c.idCita) === String(idReal)
          ? { ...c, estado: 'PENDIENTE', trasladadoAHistorial: false }
          : c
      )
    );
    setPestanaRecepcion('activas');
  };

  const handleCancelarCita = async (cita) => {
    const idCita = cita.id || cita.idCita;
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita médica? Se trasladará al historial como CANCELADA.')) return;
    try {
      await ApiService.cancelarCita(idCita).catch(() => null);
      await ApiService.confirmarCita(idCita, {
        estado: 'CANCELADA',
        notasRecepcion: 'Cancelada desde el panel de recepción.',
        horaConfirmacion: new Date().toISOString()
      });

      const nombrePaciente = cita.paciente?.nombre
        ? `${cita.paciente.nombre} ${cita.paciente.apellidos || ''}`.trim()
        : cita.nombrePaciente || `Paciente #${idCita}`;

      EmailQueueService.encolarCorreo({
        plantillaId: 'CANCELACION_CITA',
        prioridad: 'ALTA',
        variables: {
          paciente: nombrePaciente,
          correo: cita.paciente?.correo || 'paciente@dentalfine.com',
          dentista: cita.dentista?.nombre ? `Dr(a). ${cita.dentista.nombre}` : 'Especialista asignado',
          servicio: cita.tipoServicio?.nombre || 'Consulta Dental',
          fecha: cita.fecha ? cita.fecha.split('T')[0] : strFechaSeleccionada,
          hora: cita.fecha && cita.fecha.includes('T') ? `${cita.fecha.split('T')[1].substring(0, 5)} hrs` : '00:00 hrs',
          folio: `#DF-${idCita}`,
          notas: 'Cancelación solicitada y registrada en recepción.'
        }
      });

      setCitas((prev) =>
        prev.map((c) =>
          (c.id === idCita || c.idCita === idCita)
            ? {
                ...c,
                estado: 'CANCELADA',
                notasRecepcion: 'Cancelada desde el panel de recepción.',
                horaConfirmacion: new Date().toISOString(),
                trasladadoAHistorial: true
              }
            : c
        )
      );
    } catch (err) {
      console.error(err);
      alert('No se pudo procesar la cancelación.');
    }
  };

  // --- CONTROLES Y CÁLCULOS DEL CALENDARIO ---
  const cambiarMes = (offset) => {
    setMesMostrado(new Date(mesMostrado.getFullYear(), mesMostrado.getMonth() + offset, 1));
  };

  const obtenerDiasDelMes = () => {
    const year = mesMostrado.getFullYear();
    const month = mesMostrado.getMonth();
    const totalDias = new Date(year, month + 1, 0).getDate();
    const primerDiaIndex = new Date(year, month, 1).getDay();

    const celdas = [];
    for (let i = 0; i < primerDiaIndex; i++) celdas.push(null);
    for (let i = 1; i <= totalDias; i++) celdas.push(new Date(year, month, i));
    return celdas;
  };

  const diasCalendario = obtenerDiasDelMes();
  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const nombreMeses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];

  const totalConfirmadasHistorial = citas.filter((c) =>
    ['FINALIZADA', 'ATENDIDA', 'COMPLETADA'].includes((c.estado || '').toUpperCase())
  ).length;

  if (cargando) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-slate-50 text-indigo-600">
        <Loader2 className="animate-spin mb-2" size={40} />
        <p className="text-sm font-bold text-slate-500">Cargando agenda principal de recepción...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 h-screen animate-in fade-in duration-500 font-sans">
      <div className="mb-6 relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Recepción</h1>
          <p className="text-slate-500 mt-1">
            Confirmación de asistencia, control de agenda diaria y archivo en historial clínico.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/correos')}
            className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold py-3 px-5 rounded-2xl flex items-center gap-2 shadow-2xs transition-all text-xs cursor-pointer"
          >
            <Sparkles size={16} /> Cola de Correos Async
          </button>
          <button
            onClick={abrirModalNuevaCita}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 text-xs cursor-pointer"
          >
            <Plus size={16} /> Agendar Cita
          </button>
        </div>
      </div>

      {/* BANNER DE CONFIRMACIÓN Y TRASLADO AL HISTORIAL */}
      {notificacionTraslado && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Archive size={20} />
            </div>
            <div>
              <p className="text-sm font-black">
                Cita #{notificacionTraslado.id} confirmada ({notificacionTraslado.estado}) y trasladada al Historial
              </p>
              <p className="text-xs text-emerald-700 font-medium">
                {notificacionTraslado.jobCorreo
                  ? `Se encoló el envío asíncrono (${notificacionTraslado.jobCorreo.id}) con el resumen de atención.`
                  : 'El registro ya está disponible para consulta en la pestaña de Historial.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setPestanaRecepcion('historial');
                setNotificacionTraslado(null);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-colors cursor-pointer"
            >
              Ver en Historial
            </button>
            <button
              onClick={() => setNotificacionTraslado(null)}
              className="px-3 py-2 rounded-xl text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MÉTRICAS RÁPIDAS (GLASSMORPHISM) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {/* Tarjeta 1: Citas Activas del Día */}
        <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.1)] transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
                Por Confirmar (Día)
              </p>
              <h3 className="text-3xl font-black text-slate-800">{citasActivasDelDia.length}</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                De {citasDelDia.length} programadas en la fecha
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <Activity size={20} />
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Confirmadas en Historial */}
        <div
          onClick={() => setPestanaRecepcion('historial')}
          className="cursor-pointer relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)] transition-all"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
                Confirmadas en Historial
              </p>
              <h3 className="text-3xl font-black text-emerald-700">{totalConfirmadasHistorial}</h3>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">Clic para abrir archivo →</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        {/* Tarjeta 3: Total Pacientes */}
        <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.1)] transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-100/50 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
                Pacientes y Doctores
              </p>
              <h3 className="text-3xl font-black text-slate-800">{totalPacientes}</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                {totalDentistas} especialistas activos
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* Tarjeta 4: Cancelaciones / Inasistencias */}
        <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.1)] transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-100/50 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
                Canceladas / Inasistencias
              </p>
              <h3 className="text-3xl font-black text-slate-800">
                {citas.filter((c) => ['CANCELADA', 'INASISTENCIA'].includes((c.estado || '').toUpperCase())).length}
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">Archivadas en historial</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm">
              <XCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ==========================================
            LADO IZQUIERDO: CALENDARIO INTERACTIVO
            ========================================== */}
        <div className="lg:col-span-6 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {nombreMeses[mesMostrado.getMonth()]} {mesMostrado.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => cambiarMes(-1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => cambiarMes(1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {nombresDias.map((dia) => (
              <div key={dia} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
                {dia}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {diasCalendario.map((fecha, idx) => {
              if (!fecha) return <div key={`vacio-${idx}`} className="h-14" />;

              const strFecha = formatoFechaLocal(fecha);
              const esSeleccionada = strFecha === strFechaSeleccionada;
              const esHoy = strFecha === formatoFechaLocal(new Date());

              const citasDiaMapeado = citas.filter((c) => c.fecha && c.fecha.startsWith(strFecha));
              const tienePendientes = citasDiaMapeado.some((c) => !ES_ESTADO_HISTORIAL(c.estado));
              const tieneConfirmadas = citasDiaMapeado.some((c) =>
                ['FINALIZADA', 'ATENDIDA', 'COMPLETADA'].includes((c.estado || '').toUpperCase())
              );
              const tieneCanceladas = citasDiaMapeado.some((c) =>
                ['CANCELADA', 'INASISTENCIA'].includes((c.estado || '').toUpperCase())
              );

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFechaSeleccionada(fecha)}
                  className={`
                    h-14 rounded-2xl flex flex-col items-center justify-center relative transition-all border cursor-pointer
                    ${
                      esSeleccionada
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : esHoy
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-700 font-bold hover:bg-indigo-100'
                        : 'bg-white border-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-200'
                    }
                  `}
                >
                  <span className={`text-sm ${esSeleccionada ? 'font-bold' : 'font-medium'}`}>
                    {fecha.getDate()}
                  </span>

                  {/* BOLITAS DE COLORES CONFIGURADAS */}
                  <div className="absolute bottom-2 flex gap-1">
                    {tienePendientes && (
                      <div className={`w-1.5 h-1.5 rounded-full ${esSeleccionada ? 'bg-white' : 'bg-amber-500'}`} />
                    )}
                    {tieneConfirmadas && (
                      <div className={`w-1.5 h-1.5 rounded-full ${esSeleccionada ? 'bg-emerald-200' : 'bg-emerald-500'}`} />
                    )}
                    {tieneCanceladas && (
                      <div className={`w-1.5 h-1.5 rounded-full ${esSeleccionada ? 'bg-red-200' : 'bg-red-500'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs font-bold text-slate-500 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Por Confirmar
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Confirmadas (Historial)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Canceladas / Inasistencia
            </div>
          </div>
        </div>

        {/* ==========================================
            LADO DERECHO: VISTA DE RECEPCIÓN (AGENDA ACTIVA Y TRASLADO A HISTORIAL)
            ========================================== */}
        <div className="lg:col-span-6 flex flex-col h-[calc(100vh-11rem)] min-h-[540px]">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
            {/* CABECERA CON PESTAÑAS: AGENDA ACTIVA VS HISTORIAL */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/70 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <CalendarIcon size={16} className="text-indigo-600" />
                    {fechaSeleccionada.toLocaleDateString('es-MX', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    Confirma la llegada del paciente para archivar la cita en el historial.
                  </p>
                </div>

                {/* SELECTOR DE PESTAÑA */}
                <div className="flex bg-slate-200/70 p-1 rounded-2xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setPestanaRecepcion('activas')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      pestanaRecepcion === 'activas'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Clock size={14} />
                    Agenda Activa
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 text-indigo-700">
                      {citasActivasDelDia.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPestanaRecepcion('historial')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      pestanaRecepcion === 'historial'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Archive size={14} />
                    Historial
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700">
                      {citasDelDia.filter((c) => ES_ESTADO_HISTORIAL(c.estado)).length}
                    </span>
                  </button>
                </div>
              </div>

              {/* CONTROLES EXCLUSIVOS DE LA PESTAÑA HISTORIAL */}
              {pestanaRecepcion === 'historial' && (
                <div className="pt-2 border-t border-slate-200/60 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setAlcanceHistorial('dia')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          alcanceHistorial === 'dia'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        Día Seleccionado
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlcanceHistorial('todos')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          alcanceHistorial === 'todos'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        Todo el Historial ({citas.filter((c) => ES_ESTADO_HISTORIAL(c.estado)).length})
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {['TODOS', 'FINALIZADA', 'CANCELADA'].map((est) => (
                        <button
                          key={est}
                          type="button"
                          onClick={() => setFiltroEstadoHistorial(est)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                            filtroEstadoHistorial === est
                              ? 'bg-slate-900 text-white'
                              : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {est === 'TODOS' ? 'Todos' : est === 'FINALIZADA' ? 'Confirmadas' : 'Canceladas/Inasist.'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={busquedaHistorial}
                      onChange={(e) => setBusquedaHistorial(e.target.value)}
                      placeholder="Buscar en el historial por paciente, doctor, servicio o folio..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* LISTA DE CITAS SEGÚN PESTAÑA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {pestanaRecepcion === 'activas' ? (
                citasActivasDelDia.length > 0 ? (
                  citasActivasDelDia.map((cita) => {
                    const horaCita =
                      cita.fecha && cita.fecha.includes('T')
                        ? cita.fecha.split('T')[1].substring(0, 5)
                        : '00:00';
                    const idReal = cita.id || cita.idCita;
                    const nombrePaciente = cita.paciente?.nombre
                      ? `${cita.paciente.nombre} ${cita.paciente.apellidos || ''}`
                      : cita.nombrePaciente || `Paciente ID: ${cita.idPaciente || cita.paciente?.id}`;

                    return (
                      <div
                        key={idReal}
                        className="p-5 rounded-2xl border bg-white border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="px-3 py-1.5 rounded-xl text-xs font-black tracking-tight bg-indigo-50 text-indigo-700">
                              {horaCita}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-amber-100 text-amber-700">
                              {cita.estado || 'PENDIENTE'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">#{idReal}</span>
                          </div>

                          {/* ACCIONES DE RECEPCIÓN: CONFIRMAR Y MOVER AL HISTORIAL / EDITAR / CANCELAR */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => abrirModalConfirmarCita(cita)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                              title="Confirmar asistencia y trasladar al historial"
                            >
                              <CheckCircle2 size={14} />
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => abrirModalEditarCita(cita)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                              title="Reprogramar Cita"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelarCita(cita)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Cancelar Cita"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Detalle de la cita */}
                        <div className="space-y-1.5 pl-0.5">
                          <div className="flex items-center gap-2 text-sm text-slate-800 font-bold">
                            <User size={14} className="text-slate-400" />
                            <span>{nombrePaciente}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                            <Stethoscope size={14} className="text-slate-400" />
                            <span>{cita.tipoServicio?.nombre || 'Consulta Dental Programada'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <Clock size={14} className="text-slate-400" />
                            <span>
                              Especialista: Dr(a).{' '}
                              {cita.dentista?.nombre || cita.nombreDentista || `ID: ${cita.idDentista || cita.dentista?.id}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 text-center">
                    <CheckCircle2 size={40} className="text-emerald-300 mb-3" />
                    <p className="text-sm font-black text-slate-700">No hay citas pendientes por confirmar</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Todas las citas de este día fueron trasladadas al historial o no hay citas programadas.
                    </p>
                    {citasDelDia.some((c) => ES_ESTADO_HISTORIAL(c.estado)) && (
                      <button
                        type="button"
                        onClick={() => setPestanaRecepcion('historial')}
                        className="mt-4 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        Revisar Historial del Día ({citasDelDia.filter((c) => ES_ESTADO_HISTORIAL(c.estado)).length})
                      </button>
                    )}
                  </div>
                )
              ) : /* PESTAÑA DE HISTORIAL DE RECEPCIÓN */
              citasHistorialFiltradas.length > 0 ? (
                citasHistorialFiltradas.map((cita) => {
                  const idReal = cita.id || cita.idCita;
                  const fechaCita = cita.fecha ? cita.fecha.split('T')[0] : '';
                  const horaCita =
                    cita.fecha && cita.fecha.includes('T')
                      ? cita.fecha.split('T')[1].substring(0, 5)
                      : '00:00';
                  const estadoUpper = (cita.estado || 'FINALIZADA').toUpperCase();
                  const esConfirmada = ['FINALIZADA', 'ATENDIDA', 'COMPLETADA'].includes(estadoUpper);
                  const esInasistencia = estadoUpper === 'INASISTENCIA';

                  const nombrePaciente = cita.paciente?.nombre
                    ? `${cita.paciente.nombre} ${cita.paciente.apellidos || ''}`
                    : cita.nombrePaciente || `Paciente ID: ${cita.idPaciente || cita.paciente?.id}`;

                  return (
                    <div
                      key={idReal}
                      className={`p-5 rounded-2xl border transition-all ${
                        esConfirmada
                          ? 'bg-emerald-50/30 border-emerald-200/80'
                          : esInasistencia
                          ? 'bg-amber-50/40 border-amber-200/80'
                          : 'bg-red-50/30 border-red-200/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="px-3 py-1 rounded-xl text-xs font-black bg-white border border-slate-200 text-slate-700">
                            {fechaCita} · {horaCita}
                          </div>
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1 ${
                              esConfirmada
                                ? 'bg-emerald-100 text-emerald-800'
                                : esInasistencia
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            <Archive size={11} />
                            {estadoUpper}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">Folio #{idReal}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRestaurarCitaAAgenda(cita)}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Devolver cita a la agenda activa"
                        >
                          <RotateCcw size={12} /> Restaurar
                        </button>
                      </div>

                      <div className="space-y-1.5 pl-0.5">
                        <div className="flex items-center gap-2 text-sm text-slate-900 font-bold">
                          <User size={14} className="text-slate-400" />
                          <span>{nombrePaciente}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Stethoscope size={14} className="text-slate-400" />
                          <span>
                            {cita.tipoServicio?.nombre || 'Consulta Dental'} · Dr(a).{' '}
                            {cita.dentista?.nombre || cita.nombreDentista || 'Especialista'}
                          </span>
                        </div>

                        {cita.notasRecepcion && (
                          <div className="mt-2.5 p-3 rounded-xl bg-white/90 border border-slate-200/70 text-xs text-slate-600 flex items-start gap-2">
                            <FileText size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-800">Nota de recepción: </span>
                              {cita.notasRecepcion}
                              {cita.horaConfirmacion && (
                                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                  Archivado en historial:{' '}
                                  {new Date(cita.horaConfirmacion).toLocaleString('es-MX', {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 text-center">
                  <Archive size={40} className="text-slate-200 mb-3" />
                  <p className="text-sm font-bold text-slate-600">Sin registros en el historial</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Cuando confirmes la asistencia o canceles una cita en recepción, se trasladará automáticamente aquí.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Agendar o Reprogramar Citas */}
      <ModalCita
        isOpen={isModalOpen}
        citaEditando={citaAEditar}
        onClose={(resultado) => {
          setIsModalOpen(false);
          if (resultado) cargarTodasLasCitas();
        }}
      />

      {/* Modal de Confirmación de Cita y Traslado al Historial (HU05-T02) */}
      <ModalConfirmacionCita
        isOpen={Boolean(citaAConfirmar)}
        cita={citaAConfirmar}
        onClose={() => setCitaAConfirmar(null)}
        onConfirmado={handleCitaConfirmada}
      />
    </div>
  );
}
