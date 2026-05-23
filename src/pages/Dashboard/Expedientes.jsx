import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, AlertCircle, Loader2, Phone, Mail, FileText, Heart, ShieldCheck, X, Plus, Edit2, Trash2 } from 'lucide-react';
import { ApiService } from '../../services/api.js'; 
import ModalPaciente from '../../components/Modales/ModalPaciente';

export default function Expedientes() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pacienteAEditar, setPacienteAEditar] = useState(null);

  useEffect(() => { cargarTodosLosPacientes(); }, []);

  const cargarTodosLosPacientes = async () => {
    setCargando(true);
    try {
      const data = await ApiService.obtenerPacientes();
      setPacientes(data || []);
    } catch (err) { console.error("Error:", err); } finally { setCargando(false); }
  };

  useEffect(() => {
    if (busqueda.trim() === '') { cargarTodosLosPacientes(); return; }
    const delayDebounce = setTimeout(async () => {
      setCargando(true);
      try {
        const data = await ApiService.buscarPacientes(busqueda);
        const formateados = data.map(p => ({ id: p.idPaciente || p.id, nombre: p.nombre, apellidos: p.apellidos, telefono: p.telefono, correo: p.correo }));
        setPacientes(formateados);
      } catch (err) { console.error(err); } finally { setCargando(false); }
    }, 350);
    return () => clearTimeout(delayDebounce);
  }, [busqueda]);

  const handleVerFichaRapida = async (id) => {
    setCargandoDetalle(true);
    try {
      const detalle = await ApiService.obtenerPacientePorId(id);
      setPacienteSeleccionado({
        id: detalle.id || id, nombre: detalle.nombre || 'Paciente', apellidos: detalle.apellidos || '',
        telefono: detalle.telefono || 'Sin registrar', correo: detalle.correo || 'Sin registrar',
        tipoSanguineo: detalle.tipoSanguineo || "O+", alergias: detalle.alergias || "Ninguna reportada",
        antecedentes: detalle.antecedentes || "Sin antecedentes", observaciones: detalle.observaciones || "Paciente activo."
      });
    } catch (err) {
      const local = pacientes.find(p => p.id === id);
      if (local) setPacienteSeleccionado({...local, tipoSanguineo: "O+", alergias: "Ninguna", antecedentes: "Sin datos", observaciones: "Cargado de Demo"});
    } finally { setCargandoDetalle(false); }
  };

  // MAGIA DEMO: Eliminación instantánea en pantalla
  const handleEliminarPaciente = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este expediente?")) {
      await ApiService.eliminarPaciente(id);
      setPacientes(pacientes.filter(p => p.id !== id)); // Lo borramos de la vista inmediatamente
      alert("Paciente eliminado correctamente de la vista.");
    }
  };

  const abrirModalNuevo = () => { setPacienteAEditar(null); setIsModalOpen(true); };

  const abrirModalEditar = async (id) => {
    try {
      const detalle = await ApiService.obtenerPacientePorId(id);
      setPacienteAEditar(detalle); setIsModalOpen(true);
    } catch (error) {
      const basico = pacientes.find(p => p.id === id);
      setPacienteAEditar(basico); setIsModalOpen(true);
    }
  };

  // MAGIA DEMO: Actualización instantánea de la tabla al guardar
  const manejarGuardadoExitoso = (datosPaciente, accion) => {
    if (accion === 'crear') {
      setPacientes([datosPaciente, ...pacientes]); // Lo ponemos al principio de la lista
    } else {
      setPacientes(pacientes.map(p => p.id === datosPaciente.id ? datosPaciente : p)); // Actualizamos el editado
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 h-screen relative flex">
      <div className="flex-1 pr-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Expedientes Médicos</h1>
            <p className="text-slate-500 mt-1">Gestión, consulta y control de pacientes registrados.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input type="text" placeholder="Buscar por nombre o ID..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-sm" />
            </div>
            <button onClick={abrirModalNuevo} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 whitespace-nowrap"><Plus size={18} /> Nuevo Paciente</button>
          </div>
        </div>

        {cargando ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-indigo-600"><Loader2 className="animate-spin mb-4" size={40} /><p className="font-medium text-slate-500">Filtrando registros en PostgreSQL...</p></div>
        ) : pacientes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pacientes.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group animate-in zoom-in-95 duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-lg">{p.nombre ? p.nombre[0].toUpperCase() : 'P'}</div>
                      <div>
                        <h3 className="font-bold text-slate-900">{p.nombre} {p.apellidos || ''}</h3>
                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-0.5">ID: #{p.id}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => abrirModalEditar(p.id)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
                       <button onClick={() => handleEliminarPaciente(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-slate-50 pt-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /><span>{p.telefono || 'Sin registrar'}</span></div>
                    <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /><span className="text-xs text-slate-500 truncate max-w-[190px]">{p.correo || 'pendiente@dentalfine.com'}</span></div>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <button onClick={() => handleVerFichaRapida(p.id)} disabled={cargandoDetalle} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors">{cargandoDetalle && pacienteSeleccionado?.id === p.id ? 'Leyendo...' : 'Ficha Rápida'}</button>
                  <button onClick={() => navigate(`/dashboard/expediente/${p.id}`)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-xl transition-colors flex items-center justify-center"><ChevronRight size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[32px] p-12 text-center text-slate-400 max-w-md mx-auto mt-12 shadow-sm"><AlertCircle size={40} className="mx-auto mb-4 text-orange-400 opacity-80" /><h3 className="text-lg font-bold text-slate-800 mb-1">Sin coincidencias</h3></div>
        )}
      </div>

      {pacienteSeleccionado && (
        <div className="w-96 bg-white border-l border-slate-200 h-screen fixed top-0 right-0 shadow-2xl z-40 p-6 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100"><div className="flex items-center gap-2 text-slate-900 font-bold"><FileText size={20} className="text-indigo-600" /><h3>Ficha Clínica</h3></div><button onClick={() => setPacienteSeleccionado(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={18} /></button></div>
          <div className="flex-1 overflow-y-auto py-6 space-y-6 custom-scrollbar">
            <div className="text-center"><div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-lg">{pacienteSeleccionado.nombre ? pacienteSeleccionado.nombre[0].toUpperCase() : 'P'}</div><h4 className="font-bold text-slate-900 text-lg">{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellidos || ''}</h4><p className="text-xs text-slate-400 font-bold">ID Paciente: #{pacienteSeleccionado.id}</p></div>
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contacto Directo</h5>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-sm text-slate-700"><p><span className="font-semibold text-slate-400">Tel:</span> {pacienteSeleccionado.telefono}</p><p className="truncate"><span className="font-semibold text-slate-400">Email:</span> {pacienteSeleccionado.correo}</p></div>
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Salud General</h5>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3"><div className="flex items-center justify-between text-sm"><span className="text-slate-500 flex items-center gap-1.5"><Heart size={14} className="text-red-500" /> Sangre:</span><span className="font-bold text-slate-800">{pacienteSeleccionado.tipoSanguineo}</span></div><div className="flex items-center justify-between text-sm"><span className="text-slate-500 flex items-center gap-1.5"><AlertCircle size={14} className="text-orange-500" /> Alergias:</span><span className="font-bold text-slate-800">{pacienteSeleccionado.alergias}</span></div></div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONECTADO CON EL MODO DEMO */}
      <ModalPaciente 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        pacienteEditando={pacienteAEditar} 
        onGuardarExitoso={manejarGuardadoExitoso}
      />
    </div>
  );
}