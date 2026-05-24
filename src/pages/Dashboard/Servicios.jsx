import { useState, useEffect } from 'react';
import { Activity, Plus, Trash2, Edit2, DollarSign, Clock, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ApiService } from '../../services/api.js';

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');

  // Estados para el Modal (Agregar / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  
  // Campos del formulario (Alineados con la tabla tipo_servicios de PostgreSQL)
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [duracion, setDuracion] = useState('30'); // Por defecto 30 min

  useEffect(() => {
    cargarServicios();
  }, []);

  // 1. LEER (READ): Obtener todos los servicios del backend
  const cargarServicios = async () => {
    setCargando(true);
    setError('');
    try {
      const data = await ApiService.obtenerServicios();
      setServicios(data || []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar los servicios del servidor.");
    } finally {
      setCargando(false);
    }
  };

  // Abrir modal en modo creación
  const handleAgregarClick = () => {
    setServicioEditando(null);
    setNombre('');
    setPrecio('');
    setDuracion('30');
    setIsModalOpen(true);
  };

  // Abrir modal en modo edición
  const handleModificarClick = (servicio) => {
    setServicioEditando(servicio);
    setNombre(servicio.nombre);
    setPrecio(servicio.precio);
    setDuracion(servicio.duracion || '30');
    setIsModalOpen(true);
  };

  // 2. CREAR Y ACTUALIZAR (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const payload = {
      nombre,
      precio: parseFloat(precio),
      duracion: parseFloat(duracion)
    };

    try {
      if (servicioEditando) {
        await ApiService.actualizarServicio(servicioEditando.id, payload);
        setExitoMsg('¡Servicio actualizado con éxito!');
      } else {
        await ApiService.crearServicio(payload);
        setExitoMsg('¡Servicio creado con éxito!');
      }

      setIsModalOpen(false);
      cargarServicios(); // Recargar lista real
      
      setTimeout(() => setExitoMsg(''), 2500);
    } catch (err) {
      setError(err.message || 'Falla al guardar el servicio en el servidor.');
    }
  };

  // 3. ELIMINAR (DELETE)
  const handleEliminarClick = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este servicio del catálogo?')) return;
    
    try {
      await ApiService.eliminarServicio(id);
      setExitoMsg('Servicio removido correctamente.');
      cargarServicios();
      setTimeout(() => setExitoMsg(''), 2500);
    } catch (err) {
      alert(err.message || 'No se pudo eliminar el servicio.');
    }
  };

  if (cargando) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-slate-50 text-indigo-600">
        <Loader2 className="animate-spin mb-2" size={40} />
        <p className="text-sm font-bold text-slate-500">Abriendo catálogo de tratamientos...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 h-screen animate-in fade-in duration-500 font-sans">
      
      {/* CABECERA Y BOTÓN AGREGAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Activity className="text-indigo-600" size={32} /> Catálogo de Servicios
          </h1>
          <p className="text-slate-500 mt-1">Configura los tratamientos, costos operativos y tiempos de consulta.</p>
        </div>
        
        {/* BOTÓN SUPERIOR PARA AGREGAR */}
        <button 
          onClick={handleAgregarClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 text-sm w-full sm:w-auto"
        >
          <Plus size={18} /> Agregar Servicio
        </button>
      </div>

      {/* ALERTAS DE ÉXITO O ERROR */}
      {exitoMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 size={20} />
          <p className="text-sm font-bold">{exitoMsg}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* CUADRÍCULA DE TARJETITAS */}
      {servicios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((servicio) => (
            <div 
              key={servicio.id} 
              className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 group relative overflow-hidden"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Activity size={22} />
                </div>
                
                {/* Nombre del servicio */}
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug mb-2">
                  {servicio.nombre}
                </h3>
                
                <div className="space-y-2 mt-4">
                  {/* Costo */}
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <DollarSign size={16} className="text-emerald-500 font-bold" />
                    <span className="text-sm font-medium text-slate-400">Costo:</span>
                    <span className="text-base font-black text-slate-800">${servicio.precio?.toFixed(2)}</span>
                  </div>
                  
                  {/* Duración */}
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Clock size={16} className="text-slate-400" />
                    <span className="font-medium">Duración estimada:</span>
                    <span className="font-bold text-slate-700">{servicio.duracion || 30} min</span>
                  </div>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN: MODIFICAR Y ELIMINAR */}
              <div className="flex gap-3 border-t border-slate-100 pt-4 mt-6">
                <button 
                  onClick={() => handleModificarClick(servicio)}
                  className="flex-1 py-2.5 px-4 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-bold rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5 border border-slate-100"
                >
                  <Edit2 size={14} /> Modificar
                </button>
                <button 
                  onClick={() => handleEliminarClick(servicio.id)}
                  className="py-2.5 px-4 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 font-bold rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5 border border-slate-100"
                  title="Eliminar del catálogo"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Activity size={48} className="text-slate-300 mb-3 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-800">Catálogo de tratamientos vacío</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">No hay servicios registrados en PostgreSQL actualmente. Da de alta el primero utilizando el botón superior.</p>
        </div>
      )}

      {/* MODAL INTERNO: AGREGAR / MODIFICAR SERVICIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="font-bold text-slate-900 text-lg">
                {servicioEditando ? 'Modificar Parámetros' : 'Registrar Nuevo Servicio'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nombre del Servicio / Tratamiento *</label>
                <input 
                  type="text" 
                  required 
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)} 
                  placeholder="Ej. Resina de Fotocurado"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-medium" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Costo (MXN) *</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 text-sm font-bold">$</span>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      step="0.01"
                      value={precio} 
                      onChange={e => setPrecio(e.target.value)} 
                      placeholder="800"
                      className="w-full p-3.5 pl-7 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-bold text-slate-800" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Duración (Minutos) *</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={duracion} 
                    onChange={e => setDuracion(e.target.value)} 
                    placeholder="30"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-medium" 
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-50 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 py-3 rounded-xl text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl text-sm transition-colors shadow-md shadow-indigo-600/10"
                >
                  {servicioEditando ? 'Guardar Cambios' : 'Crear Servicio'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}