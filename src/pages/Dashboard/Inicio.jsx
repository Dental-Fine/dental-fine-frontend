import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Plus, Loader2, Edit2, Trash2, Stethoscope } from 'lucide-react';
import { ApiService } from '../../services/api';
import ModalCita from '../../components/Modales/ModalCita';

export default function Inicio() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para el control del Calendario Visual
  const [mesMostrado, setMesMostrado] = useState(new Date());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  
  // Estados para controlar el modal de las citas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [citaAEditar, setCitaAEditar] = useState(null);

  useEffect(() => {
    cargarTodasLasCitas();
  }, []);

  // 1. Consultar todas las citas del Spring Boot para pintar los indicadores del mes
  const cargarTodasLasCitas = async () => {
    setCargando(true);
    try {
      const data = await ApiService.obtenerCitas();
      setCitas(data || []);
    } catch (err) {
      console.error("Error al sincronizar citas en Inicio:", err);
    } finally {
      setCargando(false);
    }
  };

  // Función para formatear fechas locales a cadena YYYY-MM-DD de forma segura
  const formatoFechaLocal = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const strFechaSeleccionada = formatoFechaLocal(fechaSeleccionada);
  
  // 2. Filtrar las citas correspondientes únicamente al día seleccionado
  const citasDelDia = citas.filter(c => c.fecha && c.fecha.startsWith(strFechaSeleccionada));

  const abrirModalNuevaCita = () => {
    setCitaAEditar(null);
    setIsModalOpen(true);
  };

  const abrirModalEditarCita = (cita) => {
    setCitaAEditar(cita);
    setIsModalOpen(true);
  };

  const handleCancelarCita = async (idCita) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita médica?")) return;
    try {
      await ApiService.cancelarCita(idCita);
      // Cambiamos el estado local de inmediato para volver la bolita roja
      setCitas(citas.map(c => (c.id === idCita || c.idCita === idCita) ? { ...c, estado: 'CANCELADA' } : c));
    } catch (err) {
      console.error(err);
      alert("No se pudo procesar la cancelación.");
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
  const nombreMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  if (cargando) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-slate-50 text-indigo-600">
        <Loader2 className="animate-spin mb-2" size={40} />
        <p className="text-sm font-bold text-slate-500">Cargando agenda principal...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 h-screen animate-in fade-in duration-500 font-sans">
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Control</h1>
        <p className="text-slate-500 mt-1">Agenda general y estatus diario de consultas clínicas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ==========================================
            LADO IZQUIERDO: CALENDARIO INTERACTIVO
            ========================================== */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col h-fit">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {nombreMeses[mesMostrado.getMonth()]} {mesMostrado.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button onClick={() => cambiarMes(-1)} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => cambiarMes(1)} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {nombresDias.map(dia => (
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
              
              // Buscamos las citas de este casillero específico para prender las bolitas
              const citasDiaMapeado = citas.filter(c => c.fecha && c.fecha.startsWith(strFecha));
              const tieneActivas = citasDiaMapeado.some(c => c.estado !== 'CANCELADA');
              const tieneCanceladas = citasDiaMapeado.some(c => c.estado === 'CANCELADA');

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFechaSeleccionada(fecha)}
                  className={`
                    h-14 rounded-2xl flex flex-col items-center justify-center relative transition-all border
                    ${esSeleccionada 
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
                    {tieneActivas && (
                      <div className={`w-1.5 h-1.5 rounded-full ${esSeleccionada ? 'bg-white' : 'bg-emerald-500'}`} />
                    )}
                    {tieneCanceladas && (
                      <div className={`w-1.5 h-1.5 rounded-full ${esSeleccionada ? 'bg-indigo-200' : 'bg-red-500'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs font-bold text-slate-500 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Citas Activas (Verde)</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Citas Canceladas (Roja)</div>
          </div>

        </div>

        {/* ==========================================
            LADO DERECHO: TARJETITAS DEL DÍA SELECCIONADO
            ========================================== */}
        <div className="lg:col-span-5 flex flex-col h-[calc(100vh-8rem)]">
          
          {/* BOTÓN SUPERIOR DE AGREGAR */}
          <button 
            onClick={abrirModalNuevaCita}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 mb-6 shrink-0 text-sm"
          >
            <Plus size={18} /> Agregar Cita
          </button>

          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                <CalendarIcon size={16} className="text-indigo-600" /> 
                {fechaSeleccionada.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {citasDelDia.length > 0 ? (
                citasDelDia
                  .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                  .map((cita) => {
                    const horaCita = cita.fecha ? cita.fecha.split('T')[1].substring(0, 5) : '00:00';
                    const isCancelada = cita.estado === 'CANCELADA';
                    const idReal = cita.id || cita.idCita;

                    return (
                      <div 
                        key={idReal} 
                        className={`p-5 rounded-2xl border transition-all ${
                          isCancelada 
                            ? 'bg-red-50/40 border-red-100 opacity-70' 
                            : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-tight ${
                              isCancelada ? 'bg-red-100 text-red-700' : 'bg-indigo-50 text-indigo-700'
                            }`}>
                              {horaCita}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                              isCancelada ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                              {cita.estado}
                            </span>
                          </div>
                          
                          {/* Botones Modificar / Cancelar */}
                          {!isCancelada && (
                            <div className="flex gap-1">
                              <button onClick={() => abrirModalEditarCita(cita)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Modificar Cita">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleCancelarCita(idReal)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancelar Cita">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Detalle de la cita */}
                        <div className="space-y-1.5 pl-0.5">
                          <div className="flex items-center gap-2 text-sm text-slate-800 font-bold">
                            <User size={14} className="text-slate-400" />
                            <span>{cita.nombrePaciente || `Paciente ID: ${cita.idPaciente}`}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                            <Stethoscope size={14} className="text-slate-400" />
                            <span>{cita.nombreServicio || `Tratamiento ID: ${cita.idTipoServicio}`}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <Clock size={14} className="text-slate-400" />
                            <span>Especialista: Dr(a). {cita.nombreDentista || `ID: ${cita.idDentista}`}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                  <CalendarIcon size={36} className="text-slate-200 mb-2" />
                  <p className="text-xs font-bold text-slate-500">Sin citas agendadas</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">No hay compromisos médicos asignados.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Modal Reutilizable de Citas de tu proyecto */}
      <ModalCita 
        isOpen={isModalOpen}
        citaEditando={citaAEditar}
        onClose={(resultado) => {
          setIsModalOpen(false);
          if (resultado) cargarTodasLasCitas(); // Recargar para actualizar los puntos de color
        }}
      />

    </div>
  );
}