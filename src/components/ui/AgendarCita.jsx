import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api'; // Asegúrate de importar la API
import { 
  Stethoscope, User, Calendar as CalendarIcon, 
  Clock, CheckCircle2, ChevronRight, ChevronLeft,
  MapPin, ShieldCheck, ArrowRight, Loader2, AlertCircle
} from 'lucide-react';

export const AgendarCita = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Estructura de datos alineada a lo que espera el Backend
  const [datos, setDatos] = useState({
    servicioId: '',
    servicioNombre: '',
    dentistaId: '',
    dentistaNombre: '',
    fecha: '',
    hora: ''
  });

  // Estados para los catálogos dinámicos desde el Backend
  const [servicios, setServicios] = useState([]);
  const [dentistas, setDentistas] = useState([]);

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [resServicios, resDentistas] = await Promise.all([
          api.get('/servicios'),
          api.get('/dentistas')
        ]);
        setServicios(resServicios.data);
        setDentistas(resDentistas.data);
      } catch (err) {
        console.error("Error al cargar catálogos:", err);
        setError('No se pudieron cargar los datos iniciales de la clínica. Verifica la conexión.');
      }
    };
    cargarCatalogos();
  }, []);

  // Estado para guardar las horas que devuelve el Backend
  const [horasDisponibles, setHorasDisponibles] = useState([]);

  const siguiente = () => setPaso(paso + 1);
  const atras = () => {
    setPaso(paso - 1);
    setError(''); // Limpiamos errores al retroceder
  };

  // --- FUNCIÓN QUE LLAMA AL BACKEND PARA HORARIOS (PASO 2) ---
  const buscarHorarios = async (fechaSeleccionada) => {
    if (!datos.dentistaId || !fechaSeleccionada) return;
    
    try {
      setCargando(true);
      setError('');
      // Llamada real al endpoint GET /citas/disponibilidad
      const respuesta = await api.get('/citas/disponibilidad', {
        params: {
          dentistaId: datos.dentistaId,
          fecha: fechaSeleccionada
        }
      });
      // Filtramos las horas que el backend marca como "disponible: true"
      const horariosLibres = respuesta.data.filter(h => h.disponible);
      setHorasDisponibles(horariosLibres);
    } catch (err) {
      setError('Error al consultar horarios. Intenta de nuevo.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleFechaChange = (e) => {
    const nuevaFecha = e.target.value;
    setDatos({...datos, fecha: nuevaFecha, hora: ''});
    buscarHorarios(nuevaFecha);
  };

  // --- FUNCIÓN QUE GUARDA EN EL BACKEND (PASO 4) ---
  const finalizarCita = async () => {
    try {
      setCargando(true);
      setError('');
      
      const usuarioLogueado = JSON.parse(localStorage.getItem('usuario_dental_fine')) || { id: 1 };
      const fechaHoraISO = `${datos.fecha}T${datos.hora}:00`;

      // Llamada real al endpoint POST /citas/agendar
      const payload = {
        pacienteId: 1, // Hardcoded para el MVP (Paciente Richy es el id 1)
        dentistaId: parseInt(datos.dentistaId),
        fechaHoraInicio: fechaHoraISO,
        fechaHoraFin: `${datos.fecha}T${String(parseInt(datos.hora.split(':')[0]) + 1).padStart(2, '0')}:00:00`
      };

      // 2. Lo imprimimos en consola para que tú como Tech Lead veas qué viaja
      console.log("Enviando paquete al backend:", payload);

      // 3. Lo enviamos
      await api.post('/citas/agendar', payload);
      setPaso(5); // Éxito!
    } catch (err) {
      setError(err.response?.data?.message || 'Hubo un error al confirmar la cita.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden transition-all duration-500 mt-8">
      
      {/* Barra de Progreso (Solo visible hasta el paso 4) */}
      {paso <= 4 && (
        <div className="bg-primary p-8 text-white">
          <h2 className="text-2xl font-black mb-4">Nueva Cita</h2>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${paso >= num ? 'bg-white text-primary' : 'bg-white/20 text-white/60'}`}>
                  {num}
                </div>
                {num < 4 && <div className={`w-8 h-1 transition-all ${paso > num ? 'bg-white' : 'bg-white/20'}`}></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-10">
        
        {/* Mostrar errores generales */}
        {error && paso !== 1 && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
            <AlertCircle size={20} />
            <span className="font-bold text-sm">{error}</span>
          </div>
        )}

        {/* PASO 1: SERVICIO */}
        {paso === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-black text-dark mb-6 flex items-center gap-2">
              <Stethoscope className="text-primary" /> ¿Qué tratamiento necesitas?
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {servicios.map((s) => (
                <button 
                  key={s.id}
                  onClick={() => { setDatos({...datos, servicioId: s.id, servicioNombre: s.nombre}); siguiente(); }}
                  className={`p-4 text-left border rounded-2xl font-bold transition-all flex justify-between items-center group cursor-pointer ${datos.servicioId === s.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-700 hover:border-primary hover:bg-primary/5'}`}
                >
                  {s.nombre}
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: ESPECIALISTA Y FECHA */}
        {paso === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <h3 className="text-lg font-black text-dark flex items-center gap-2">
              <User className="text-primary" /> Elige tu especialista y fecha
            </h3>
            <div className="space-y-4">
              <select 
                value={datos.dentistaId}
                onChange={(e) => {
                  const dentistaSel = dentistas.find(d => d.id === parseInt(e.target.value));
                  setDatos({...datos, dentistaId: e.target.value, dentistaNombre: dentistaSel?.nombre || '', fecha: '', hora: ''});
                  setHorasDisponibles([]); // Resetear horas al cambiar doctor
                }}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-primary"
              >
                <option value="">Selecciona Dentista</option>
                {dentistas.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
                value={datos.fecha}
                onChange={handleFechaChange}
                disabled={!datos.dentistaId}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-primary disabled:opacity-50" 
              />
            </div>
            <div className="flex gap-3 pt-6">
              <button onClick={atras} className="flex-1 py-4 border border-slate-200 rounded-2xl font-black text-slate-500 cursor-pointer">Atrás</button>
              {/* Solo deja avanzar si el backend ya devolvió horas (significa que seleccionó doctor y fecha válidos) */}
              <button onClick={siguiente} disabled={!datos.fecha || horasDisponibles.length === 0} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/30 disabled:opacity-50 cursor-pointer">Siguiente</button>
            </div>
          </div>
        )}

        {/* PASO 3: HORARIOS */}
        {paso === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <h3 className="text-lg font-black text-dark mb-6 flex items-center gap-2">
              <Clock className="text-primary" /> Horario disponible
            </h3>
            
            {cargando ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={32}/></div>
            ) : horasDisponibles.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {horasDisponibles.map(h => (
                  <button 
                    key={h.horaInicio} 
                    onClick={() => setDatos({...datos, hora: h.horaInicio})}
                    className={`p-4 border rounded-2xl font-bold transition-all ${datos.hora === h.horaInicio ? 'bg-primary text-white border-primary' : 'border-slate-200 text-dark hover:border-primary cursor-pointer'}`}
                  >
                    {h.horaInicio} hrs
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-200">
                <p className="font-bold text-slate-500">No hay horarios libres para esta fecha.</p>
              </div>
            )}

            <div className="flex gap-3 pt-10">
              <button onClick={atras} className="flex-1 py-4 border border-slate-200 rounded-2xl font-black text-slate-500 cursor-pointer">Atrás</button>
              <button onClick={siguiente} disabled={!datos.hora} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/30 disabled:opacity-50 cursor-pointer">Revisar Cita</button>
            </div>
          </div>
        )}

        {/* PASO 4: CONFIRMACIÓN */}
        {paso === 4 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-primary/10 text-primary rounded-full mb-2">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-black text-dark">Confirma tu selección</h3>
              <p className="text-slate-500 text-sm">Verifica que los datos sean correctos antes de agendar.</p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tratamiento</p>
                  <p className="font-bold text-dark">{datos.servicioNombre}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Especialista</p>
                  <p className="font-bold text-dark">{datos.dentistaNombre}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="text-slate-400" size={18} />
                  <span className="font-bold text-sm text-slate-700">{datos.fecha}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-slate-400" size={18} />
                  <span className="font-bold text-sm text-slate-700">{datos.hora} hrs</span>
                </div>
              </div>
            </div>

            <button 
              disabled={cargando}
              onClick={finalizarCita}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-green-100 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              {cargando ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Confirmar y Agendar</>}
            </button>
            <button onClick={atras} disabled={cargando} className="w-full text-slate-400 font-bold text-sm hover:text-dark cursor-pointer disabled:opacity-50">Corregir datos</button>
          </div>
        )}

        {/* PASO 5: ÉXITO */}
        {paso === 5 && (
          <div className="text-center animate-in zoom-in-90 duration-700 py-10">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-3xl font-black text-dark mb-2">¡Cita Agendada!</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">Tu cita ha sido registrada exitosamente. Puedes ver los detalles en tu lista de citas.</p>
            
            <button 
              onClick={() => navigate('/paciente/citas')}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/30 flex items-center justify-center gap-2 mx-auto hover:scale-105 transition-all cursor-pointer"
            >
              Ir a Mis Citas <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};