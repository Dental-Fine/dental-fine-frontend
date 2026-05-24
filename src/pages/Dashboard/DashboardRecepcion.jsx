import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Plus, Loader2, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { ApiService } from '../../services/api';
import ModalCita from '../../components/Modales/ModalCita';

export default function DashboardRecepcion() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [citaAEditar, setCitaAEditar] = useState(null);

  useEffect(() => {
    cargarCitasDelServidor();
  }, [fechaSeleccionada]);

  const cargarCitasDelServidor = async () => {
    setCargando(true);
    try {
      const data = await ApiService.obtenerCitas();
      const year = fechaSeleccionada.getFullYear();
      const month = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
      const day = String(fechaSeleccionada.getDate()).padStart(2, '0');
      const fechaStr = `${year}-${month}-${day}`;
      const filtradas = (data || []).filter(c => c.fecha && c.fecha.startsWith(fechaStr));
      setCitas(filtradas);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleCancelarCita = async (idCita) => {
    if (!idCita) return;
    if (window.confirm("¿Estás seguro de que deseas cancelar esta cita médica?")) {
      try {
        await ApiService.cancelarCita(idCita);
        cargarCitasDelServidor();
      } catch (err) {
        alert("Ocurrió un error en el backend.");
      }
    }
  };

  const handleAbrirModificar = (cita) => {
    if (!cita) return;
    let fechaLimpia = '';
    let horaLimpia = '';
    if (cita.fecha) {
      const partes = cita.fecha.split('T');
      fechaLimpia = partes[0];
      horaLimpia = partes[1] ? partes[1].substring(0, 5) : '';
    }

    setCitaAEditar({
      id: cita.id || cita.idCita,
      idCita: cita.idCita || cita.id,
      pacienteId: cita.pacienteId || cita.idPaciente,
      idPaciente: cita.idPaciente || cita.pacienteId,
      dentistaId: cita.dentistaId || cita.idDentista,
      idDentista: cita.idDentista || cita.dentistaId,
      tipoServicioId: cita.tipoServicioId || cita.idTipoServicio || cita.servicioId,
      idTipoServicio: cita.idTipoServicio || cita.tipoServicioId || cita.servicioId,
      fecha: fechaLimpia,
      hora: horaLimpia,
      nombrePaciente: cita.nombrePaciente,
      nombreDentista: cita.nombreDentista
    });
    setIsModalOpen(true);
  };

  const handleAbrirNuevo = () => { setCitaAEditar(null); setIsModalOpen(true); };

  const obtenerDiasDelMes = () => {
    const año = fechaSeleccionada.getFullYear();
    const mes = fechaSeleccionada.getMonth();
    const primerDia = new Date(año, mes, 1).getDay();
    const totalDias = new Date(año, mes + 1, 0).getDate();
    
    const celdas = [];
    for (let i = 0; i < (primerDia === 0 ? 6 : primerDia - 1); i++) { celdas.push(null); }
    for (let d = 1; d <= totalDias; d++) { celdas.push(new Date(año, mes, d)); }
    return celdas;
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 h-screen animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-slate-500 mt-1">Gestión unificada de agenda y pacientes.</p>
        </div>
        <button onClick={handleAbrirNuevo} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 text-sm">
          <Plus size={18} /> Agendar Cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm">
              {fechaSeleccionada.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
            <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {obtenerDiasDelMes().map((dia, idx) => {
              if (!dia) return <div key={`empty-${idx}`} />;
              const esHoy = dia.getDate() === fechaSeleccionada.getDate() && dia.getMonth() === fechaSeleccionada.getMonth();
              return (
                <button
                  key={`day-${idx}`}
                  type="button"
                  onClick={() => setFechaSeleccionada(dia)}
                  className={`py-3 text-sm font-bold rounded-xl transition-all ${
                    esHoy ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {dia.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
            <CalendarIcon size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Agenda del {fechaSeleccionada.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </h3>
          </div>

          {cargando ? (
            <div className="flex-1 flex flex-col items-center justify-center text-indigo-600">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-xs text-slate-400 font-semibold">Consultando base de datos...</p>
            </div>
          ) : citas.length > 0 ? (
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[50vh] pr-1 custom-scrollbar">
              {citas.map((cita) => {
                const idActual = cita.id || cita.idCita;
                return (
                  <div key={idActual} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center font-extrabold text-indigo-600 text-sm shadow-sm">
                        {cita.fecha ? cita.fecha.split('T')[1]?.substring(0, 5) : '00:00'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{cita.nombrePaciente || 'Paciente'}</h4>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">{cita.nombreDentista || 'Dentista'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        cita.estado === 'CANCELADA' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {cita.estado || 'PENDIENTE'}
                      </span>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {cita.estado !== 'CANCELADA' && (
                          <>
                            <button onClick={() => handleAbrirModificar(cita)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Modificar Horario"><Edit2 size={15} /></button>
                            <button onClick={() => handleCancelarCita(idActual)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Cancelar Cita"><Trash2 size={15} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
              <AlertCircle size={36} className="text-slate-300 mb-2" />
              <p className="text-sm font-bold">No hay citas agendadas</p>
            </div>
          )}
        </div>
      </div>

      <ModalCita 
        isOpen={isModalOpen}
        onClose={(datosSimulados) => {
          setIsModalOpen(false);
          
          // ✨ AQUÍ ESTÁ LA MAGIA: Si el modal nos mandó la hora nueva, la pintamos a la fuerza
          if (datosSimulados && citaAEditar) {
            setCitas(citasActuales => citasActuales.map(c => {
              const idC = c.id || c.idCita;
              const idE = citaAEditar.id || citaAEditar.idCita;
              if (idC === idE) {
                return { ...c, fecha: datosSimulados.nuevaFechaHora };
              }
              return c;
            }));
          } else {
            // Si es una cita nueva normal, sí le preguntamos a la base de datos
            cargarCitasDelServidor(); 
          }
        }}
        citaEditando={citaAEditar}
      />
    </div>
  );
}