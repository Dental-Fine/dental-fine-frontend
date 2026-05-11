import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Stethoscope, CheckCircle2, Loader2, BriefcaseMedical } from 'lucide-react';
import { ApiService } from '../../services/api';

export default function ModalCita({ isOpen, onClose, citaEditando }) {
  // Estados para enviar al backend
  const [cargandoGuardar, setCargandoGuardar] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  // Estados controlados para poder "escuchar" cuándo cambian y buscar disponibilidad
  const [dentistaId, setDentistaId] = useState(citaEditando?.id_dentista || '');
  const [fecha, setFecha] = useState(citaEditando?.fecha || '');
  const [horaSeleccionada, setHoraSeleccionada] = useState(citaEditando?.hora || '');
  
  // Estados para los horarios inteligentes
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [buscandoHorarios, setBuscandoHorarios] = useState(false);

  // --- EFECTO: BUSCAR DISPONIBILIDAD ---
  // Este useEffect se dispara cada vez que el "dentistaId" o la "fecha" cambian
  useEffect(() => {
    // Si falta el dentista o la fecha, limpiamos los horarios
    if (!dentistaId || !fecha) {
      setHorariosDisponibles([]);
      return;
    }

    const buscarDisponibilidad = async () => {
      setBuscandoHorarios(true);
      setHoraSeleccionada(''); // Limpiamos la hora anterior si cambian de día
      try {
        const respuesta = await ApiService.consultarDisponibilidad(dentistaId, fecha);
        setHorariosDisponibles(respuesta);
      } catch (err) {
        console.error("Error al traer horarios", err);
        setError("No se pudieron cargar los horarios del dentista.");
      } finally {
        setBuscandoHorarios(false);
      }
    };

    // Pequeño retardo (debounce) para no saturar si escriben el ID muy rápido
    const timeout = setTimeout(buscarDisponibilidad, 500);
    return () => clearTimeout(timeout);
  }, [dentistaId, fecha]);

  if (!isOpen) return null;

  const titulo = citaEditando ? 'Actualizar Cita' : 'Nueva Cita Rápida';
  const textoBoton = citaEditando ? 'Guardar Cambios' : 'Agendar Cita';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación extra: Asegurarnos de que eligió una hora de los botones
    if (!horaSeleccionada) {
      setError('Por favor, selecciona un horario disponible.');
      return;
    }

    setCargandoGuardar(true);
    const pacienteId = e.target.pacienteId.value;
    const tipoServicioId = e.target.tipoServicioId.value;
    
    // Formateamos para Java: "2026-04-16T09:00:00"
    const fechaHora = `${fecha}T${horaSeleccionada}:00`;

    try {
      if (citaEditando) {
        console.log("Actualización simulada por ahora");
        setTimeout(() => onClose(), 500);
      } else {
        await ApiService.agendarCita(pacienteId, dentistaId, tipoServicioId, fechaHora);
        setExito(true);
        setTimeout(() => {
          setExito(false);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError('Error al agendar la cita. Verifica que los IDs existan.');
    } finally {
      setCargandoGuardar(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{titulo}</h2>
            <p className="text-slate-500 text-sm">Horarios sincronizados con el dentista en tiempo real.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">{error}</div>}
          {exito && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm border border-emerald-100 font-bold">¡Cita agendada con éxito en el servidor!</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ID Paciente */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                <User size={16} className="text-indigo-600" /> ID Paciente
              </label>
              <input type="number" name="pacienteId" defaultValue={citaEditando?.id_paciente || ""} placeholder="Ej: 1" required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>

            {/* ID Servicio */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                <BriefcaseMedical size={16} className="text-indigo-600" /> ID Servicio
              </label>
              <input type="number" name="tipoServicioId" placeholder="Ej: 1 (Limpieza)" required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>

            {/* ID Dentista (CONTROLADO) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                <Stethoscope size={16} className="text-indigo-600" /> ID Dentista
              </label>
              <input type="number" required placeholder="Ej: 1"
                value={dentistaId} onChange={(e) => setDentistaId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>

            {/* Fecha (CONTROLADA) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-600" /> Fecha
              </label>
              <input type="date" required
                value={fecha} onChange={(e) => setFecha(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-600" />
            </div>

            {/* --- CUADRÍCULA DE HORARIOS INTELIGENTES --- */}
            <div className="md:col-span-2 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2 mb-3">
                <Clock size={16} className="text-indigo-600" /> Horarios Disponibles
              </label>
              
              {buscandoHorarios ? (
                <div className="flex items-center justify-center py-6 text-indigo-600">
                  <Loader2 size={24} className="animate-spin mr-2" /> Buscando disponibilidad...
                </div>
              ) : horariosDisponibles.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-sm">
                  Ingresa el ID del dentista y una fecha para ver los horarios.
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {horariosDisponibles.map((h, index) => (
                    <button
                      key={index}
                      type="button"
                      disabled={!h.disponible} // Si Java dice false, lo bloqueamos
                      onClick={() => setHoraSeleccionada(h.horaInicio)}
                      className={`py-2 px-1 rounded-xl text-sm font-bold transition-all border ${
                        !h.disponible 
                          ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed line-through' // Ocupado
                          : horaSeleccionada === h.horaInicio 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30' // Seleccionado
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-600 hover:text-indigo-600' // Libre
                      }`}
                    >
                      {h.horaInicio}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} disabled={cargandoGuardar} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancelar</button>
            <button type="submit" disabled={cargandoGuardar} className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20">
              {cargandoGuardar ? <><Loader2 size={20} className="animate-spin"/> Guardando...</> : textoBoton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}