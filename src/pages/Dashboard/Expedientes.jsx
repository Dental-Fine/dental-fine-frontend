import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ChevronRight, Filter, Check, XCircle } from 'lucide-react';

export default function Expedientes() {
  const navigate = useNavigate();
  
  // --- ESTADOS DEL BUSCADOR Y FILTROS ---
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [mostrarMenuFiltros, setMostrarMenuFiltros] = useState(false);

  // Mock de pacientes (Datos simulados)
  const pacientes = [
    { id: 101, nombre: 'Valeria García', ultimaVisita: '16 Abr 2026', estado: 'En Tratamiento' },
    { id: 102, nombre: 'Carlos Rodríguez', ultimaVisita: '10 Abr 2026', estado: 'Alta' },
    { id: 103, nombre: 'Ana Martínez', ultimaVisita: '05 Abr 2026', estado: 'Urgencia' },
    { id: 104, nombre: 'Jorge Pérez', ultimaVisita: '28 Mar 2026', estado: 'Seguimiento' },
    { id: 105, nombre: 'Luis Fernando', ultimaVisita: '20 Mar 2026', estado: 'En Tratamiento' },
  ];

  // Extraemos dinámicamente los estados únicos que existen en nuestra base de datos
  const estadosDisponibles = ['Todos', ...new Set(pacientes.map(p => p.estado))];

  // --- LÓGICA DEL CEREBRO (Filtrado Combinado) ---
  const pacientesFiltrados = pacientes.filter((p) => {
    // 1. ¿Coincide con lo que escribió el usuario en la barra? (Busca por nombre o ID)
    const coincideTexto = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                          p.id.toString().includes(busqueda);
    
    // 2. ¿Coincide con el estado seleccionado en el menú?
    const coincideEstado = filtroEstado === 'Todos' || p.estado === filtroEstado;

    // Solo mostramos el paciente si cumple ambas condiciones
    return coincideTexto && coincideEstado;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Expedientes Médicos</h1>
          <p className="text-slate-500 mt-1">Busca y gestiona las historias clínicas de tus pacientes.</p>
        </div>
      </div>

      {/* --- BARRA DE BÚSQUEDA Y FILTROS --- */}
      <div className="flex gap-4 items-center bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm relative z-20">
        
        {/* Input de Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre de paciente o ID..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none text-slate-700 font-medium placeholder:font-normal"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Botón y Menú Desplegable de Filtros */}
        <div className="relative">
          <button 
            onClick={() => setMostrarMenuFiltros(!mostrarMenuFiltros)}
            className={`p-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm px-5 ${
              filtroEstado !== 'Todos' || mostrarMenuFiltros 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Filter size={18} /> 
            <span className="hidden sm:inline">
              {filtroEstado === 'Todos' ? 'Filtrar Estado' : filtroEstado}
            </span>
          </button>

          {/* Menú Flotante de Estados */}
          {mostrarMenuFiltros && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in slide-in-from-top-2">
              <div className="p-3 bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Filtrar por Estado
              </div>
              <div className="p-2 space-y-1">
                {estadosDisponibles.map((estado) => (
                  <button
                    key={estado}
                    onClick={() => {
                      setFiltroEstado(estado);
                      setMostrarMenuFiltros(false); // Cerramos el menú al elegir
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      filtroEstado === estado 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {estado}
                    {filtroEstado === estado && <Check size={16} className="text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- GRID DE RESULTADOS --- */}
      {pacientesFiltrados.length === 0 ? (
        // Estado Vacío (Si no hay resultados en la búsqueda)
        <div className="bg-white border border-slate-100 rounded-[32px] p-12 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <XCircle size={32} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No se encontraron expedientes</h3>
          <p className="text-slate-500 mt-2">Intenta buscar con otro nombre o cambia los filtros de estado.</p>
          <button 
            onClick={() => { setBusqueda(''); setFiltroEstado('Todos'); }}
            className="mt-6 text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        // Grid de Tarjetas
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pacientesFiltrados.map((p) => (
            <div 
              key={p.id}
              onClick={() => navigate(`/dashboard/expediente/${p.id}`)}
              className="group relative bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-600/10 hover:-translate-y-2 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-10 w-12 h-2 bg-indigo-100 rounded-b-lg group-hover:bg-indigo-600 transition-colors" />
              
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <User size={28} />
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{p.nombre}</h3>
              <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-wider">ID: #{p.id}</p>
              
              <div className="space-y-2 border-t border-slate-50 pt-4">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-slate-400 font-medium">Última visita:</span>
                  <span className="text-slate-700 font-bold">{p.ultimaVisita}</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-slate-400 font-medium">Estado:</span>
                  <span className={`font-extrabold px-2 py-0.5 rounded-md ${
                    p.estado === 'Urgencia' ? 'bg-red-50 text-red-600' : 
                    p.estado === 'Alta' ? 'bg-emerald-50 text-emerald-600' : 
                    'bg-indigo-50 text-indigo-600'
                  }`}>
                    {p.estado}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Abrir expediente <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}