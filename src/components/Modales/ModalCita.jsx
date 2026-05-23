import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Stethoscope, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { ApiService } from '../../services/api';

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

  const [esNuevoPaciente, setEsNuevoPaciente] = useState(false);

  // Modificado: Ahora guardará objetos completos { hora: '09:00', disponible: true/false }
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cargarCatalogos = async () => {
        try {
          const [listadoDentistas, listadoServicios, listadoPacientes] = await Promise.all([
            ApiService.obtenerDentistas(), ApiService.obtenerServicios(), ApiService.obtenerPacientes()
          ]);
          setDentistas(listadoDentistas || []);
          setServicios(listadoServicios || []);
          setPacientes(listadoPacientes || []);
        } catch (err) { console.error("Error", err); }
      };
      cargarCatalogos();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && citaEditando) {
      setPacienteId(citaEditando.paciente?.id || citaEditando.idPaciente || '');
      setDentistaId(citaEditando.dentista?.id || citaEditando.idDentista || '');
      setTipoServicioId(citaEditando.servicio?.id || citaEditando.idTipoServicio || '');

      const dateString = citaEditando.fechaHoraInicio || citaEditando.fecha || '';
      if (dateString.includes('T')) {
        setFecha(dateString.split('T')[0]);
        setHora(dateString.split('T')[1].substring(0, 5));
      }
      setEsNuevoPaciente(false);
    } else {
      setPacienteId(''); setDentistaId(''); setTipoServicioId(''); setFecha(''); setHora('');
      setEsNuevoPaciente(false);
    }
    setError(''); setExito(false);
  }, [isOpen, citaEditando]);

  // ✨ LÓGICA DE HORARIOS OCUPADOS
  useEffect(() => {
    if (fecha && dentistaId) {
      setCargandoHorarios(true);
      setTimeout(async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const headers = { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
          const res = await fetch(`http://localhost:8080/citas/disponibilidad?dentistaId=${dentistaId}&fecha=${fecha}`, { headers });
          
          if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
               
               // Transformamos lo que manda Java en un objeto útil
               let mapeados = data.map(d => {
                 if (typeof d === 'string') return { hora: d.substring(0,5), disponible: true };
                 return { 
                   hora: (d.horaInicio || d.hora || '').substring(0,5), 
                   disponible: d.disponible !== undefined ? d.disponible : true // Leemos si Java dice que está ocupado
                 };
               });
               
               // SALVAVIDAS AL EDITAR: Forzamos a que tu propia hora aparezca "disponible" para que no te bloquees a ti mismo
               if (citaEditando && citaEditando.fechaHoraInicio) {
                 const fechaOriginal = citaEditando.fechaHoraInicio.split('T')[0];
                 const horaOriginal = citaEditando.fechaHoraInicio.split('T')[1].substring(0, 5);
                 
                 if (fecha === fechaOriginal) {
                   const slotIndex = mapeados.findIndex(m => m.hora === horaOriginal);
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
          throw new Error("Usar salvavidas");
        } catch(err) {
           // Si falla el backend, mostramos unos de prueba
           const prueba = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map(h => ({
             hora: h, 
             disponible: h !== '10:00' && h !== '14:00' // Simulamos un par de ocupados
           }));
           setHorariosDisponibles(prueba);
        } finally {
          setCargandoHorarios(false);
        }
      }, 400);
    } else {
      setHorariosDisponibles([]);
    }
  }, [fecha, dentistaId, citaEditando]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hora) { setError('Por favor selecciona un horario de la cuadrícula.'); return; }
    setCargando(true); setError('');

    const fechaHoraCombinada = `${fecha}T${hora}:00`;

    try {
      if (citaEditando) {
        await ApiService.editarCita(citaEditando.id, pacienteId, dentistaId, tipoServicioId, fechaHoraCombinada);
      } else {
        await ApiService.agendarCita(pacienteId, dentistaId, tipoServicioId, fechaHoraCombinada);
      }
      setExito(true);
      setTimeout(() => { setExito(false); onClose(true); }, 1500);
    } catch (err) {
      setError(err.message || "Error al procesar.");
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{citaEditando ? 'Reprogramar Cita' : 'Agendar Cita'}</h2>
            <p className="text-slate-500 text-sm mt-1">Establece los parámetros y el horario de la consulta.</p>
          </div>
          <button onClick={() => onClose()} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="overflow-y-auto p-8 custom-scrollbar">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3"><AlertCircle size={20} /><p className="text-sm font-bold">{error}</p></div>}
          {exito ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6"><CheckCircle2 size={40} /></div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Operación Exitosa!</h3>
            </div>
          ) : (
            <form id="citaForm" onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Información del Paciente</h4>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2"><User size={14} /> Paciente Registrado *</label>
                  <select required value={pacienteId} onChange={e => setPacienteId(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium">
                    <option value="">-- Elige un paciente --</option>
                    {pacientes.map(p => (<option key={p.id || p.idPaciente} value={p.id || p.idPaciente}>{p.nombre} {p.apellidos}</option>))}
                  </select>
                </div>
              </div>

              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2 pt-2">Parámetros Médicos</h4>
              <div className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2"><User size={14} /> Dentista *</label>
                  <select required value={dentistaId} onChange={e => { setDentistaId(e.target.value); setHora(''); }} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium">
                    <option value="">-- Selecciona --</option>
                    {dentistas.map(d => (<option key={d.id || d.idDentista} value={d.id || d.idDentista}>Dr(a). {d.nombre}</option>))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2"><Stethoscope size={14} /> Tratamiento *</label>
                  <select required value={tipoServicioId} onChange={e => setTipoServicioId(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium">
                    <option value="">-- Selecciona --</option>
                    {servicios.map(s => (<option key={s.id || s.idTipoServicio} value={s.id || s.idTipoServicio}>{s.nombre}</option>))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2"><Calendar size={14} /> Fecha Programada *</label>
                  <input type="date" required value={fecha} onChange={e => { setFecha(e.target.value); setHora(''); }} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" />
                </div>

                <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2"><Clock size={14} /> Horarios Disponibles *</label>
                  
                  {!fecha || !dentistaId ? (
                    <div className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-sm text-center text-slate-400 font-medium">
                      Selecciona un especialista y una fecha para ver los horarios.
                    </div>
                  ) : cargandoHorarios ? (
                    <div className="p-6 flex justify-center items-center"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
                  ) : horariosDisponibles.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
                      {horariosDisponibles.map(h => {
                        // ✨ NUEVA VERIFICACIÓN DE ESTADO
                        const isOcupado = !h.disponible;
                        const isSeleccionado = hora === h.hora;

                        return (
                          <button
                            key={h.hora} 
                            type="button" 
                            disabled={isOcupado} // Deshabilita el click si está ocupado
                            onClick={() => setHora(h.hora)}
                            className={`py-2 px-1 rounded-xl text-[13px] font-black transition-all ${
                              isOcupado
                                ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed line-through' // Estilo bloqueado
                                : isSeleccionado 
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105' // Estilo seleccionado
                                  : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50' // Estilo normal
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

            </form>
          )}
        </div>

        {!exito && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 mt-auto sticky bottom-0 z-10">
            <button type="button" onClick={() => onClose()} disabled={cargando} className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-200 text-sm transition-colors">Cancelar</button>
            <button form="citaForm" type="submit" disabled={cargando} className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg text-sm transition-all active:scale-95">
              {cargando ? <><Loader2 className="animate-spin" size={18} /> Procesando...</> : citaEditando ? 'Actualizar Cita' : 'Confirmar Cita'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}