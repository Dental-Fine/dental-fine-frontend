import React, { useState } from 'react';
import { 
  FileText, Image as ImageIcon, File, Download, 
  Search, Filter, ExternalLink, Calendar, 
  FilePlus, MoreVertical, Check, Trash2, Edit3, Eye 
} from 'lucide-react';

export const MisDocumentos = () => {
  // 1. ESTADOS DE FILTRADO
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [filtroFormato, setFiltroFormato] = useState('Todos');
  const [ordenFecha, setOrdenFecha] = useState('recientes'); // recientes | antiguos
  
  // 2. ESTADOS DE MENÚS DESPLEGABLES
  const [mostrarMenuFiltro, setMostrarMenuFiltro] = useState(false);
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  // Mocks de documentos
  const documentos = [
    { id: 1, nombre: "Radiografía Panorámica - Inicial", tipo: "Estudio", fecha: "2026-03-15", formato: "JPG", tamaño: "2.4 MB" },
    { id: 2, nombre: "Receta: Tratamiento Antibiótico", tipo: "Receta", fecha: "2026-04-10", formato: "PDF", tamaño: "450 KB" },
    { id: 3, nombre: "Presupuesto: Ortodoncia Invisible", tipo: "Administrativo", fecha: "2026-04-12", formato: "PDF", tamaño: "1.2 MB" },
    { id: 4, nombre: "Consentimiento Informado - Extracción", tipo: "Administrativo", fecha: "2026-04-14", formato: "PDF", tamaño: "800 KB" },
  ];

  const categorias = ['Todos', 'Receta', 'Estudio', 'Administrativo'];

  // FUNCIÓN DE ICONOS SEGÚN FORMATO
  const getIcon = (formato) => {
    switch (formato.toUpperCase()) {
      case 'PDF': 
        return <FileText className="text-red-500" size={24} />;
      case 'JPG':
      case 'PNG':
      case 'JPEG':
        return <ImageIcon className="text-purple-500" size={24} />;
      default: 
        return <File className="text-slate-400" size={24} />;
    }
  };

  // 3. LÓGICA DEL "EMBUDO" DE FILTRADO Y ORDENAMIENTO
  let documentosProcesados = documentos
    // Filtro 1: Categoría (Los botones de pastilla)
    .filter(doc => filtroCategoria === 'Todos' || doc.tipo === filtroCategoria)
    // Filtro 2: Formato (El menú desplegable)
    .filter(doc => filtroFormato === 'Todos' || doc.formato === filtroFormato)
    // Filtro 3: Ordenar por fecha
    .sort((a, b) => {
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      return ordenFecha === 'recientes' ? fechaB - fechaA : fechaA - fechaB;
    });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-dark tracking-tight">Mis Documentos</h2>
          <p className="text-slate-500 font-medium mt-1">Consulta y descarga tus recetas, estudios y presupuestos.</p>
        </div>
        
        {/* CONTENEDOR RELATIVO PARA EL MENÚ DESPLEGABLE DE FILTROS */}
        <div className="relative">
           <button 
             onClick={() => setMostrarMenuFiltro(!mostrarMenuFiltro)}
             className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
               mostrarMenuFiltro || filtroFormato !== 'Todos' || ordenFecha !== 'recientes'
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
             }`}
           >
            <Filter size={18} /> Filtrar
          </button>

          {/* EL MENÚ DESPLEGABLE DE FILTROS AVANZADOS */}
          {mostrarMenuFiltro && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 animate-in fade-in slide-in-from-top-2 p-4">
              
              {/* Filtro por Formato */}
              <div className="mb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Formato de Archivo</label>
                <div className="space-y-1">
                  {['Todos', 'PDF', 'JPG'].map(fmt => (
                    <button 
                      key={fmt}
                      onClick={() => setFiltroFormato(fmt)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 flex justify-between items-center cursor-pointer"
                    >
                      {fmt}
                      {filtroFormato === fmt && <Check size={16} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ordenar por */}
              <div className="pt-4 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ordenar por</label>
                <div className="space-y-1">
                  <button 
                    onClick={() => setOrdenFecha('recientes')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 flex justify-between items-center cursor-pointer"
                  >
                    Más recientes
                    {ordenFecha === 'recientes' && <Check size={16} className="text-primary" />}
                  </button>
                  <button 
                    onClick={() => setOrdenFecha('antiguos')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 flex justify-between items-center cursor-pointer"
                  >
                    Más antiguos
                    {ordenFecha === 'antiguos' && <Check size={16} className="text-primary" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y CATEGORÍAS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-5 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                filtroCategoria === cat ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar documento..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
          />
        </div>
      </div>

      {/* GRID DE ARCHIVOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {documentosProcesados.map((doc) => (
          <div key={doc.id} className="group bg-white rounded-[32px] border border-slate-200 p-6 hover:shadow-xl hover:border-primary/30 transition-all flex flex-col relative overflow-visible">
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                
                {/* ICONO DINÁMICO */}
                <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all">
                  {getIcon(doc.formato)}
                </div>

                {/* BOTÓN 3 PUNTOS CON MENÚ CONTEXTUAL */}
                <div className="relative">
                  <button 
                    onClick={() => setMenuAbiertoId(menuAbiertoId === doc.id ? null : doc.id)}
                    className="text-slate-300 hover:text-primary p-1 cursor-pointer transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {menuAbiertoId === doc.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-30 py-2 animate-in fade-in zoom-in-95">
                      <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                        <Eye size={14} className="text-primary" /> Ver detalles
                      </button>
                      <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                        <Edit3 size={14} className="text-amber-500" /> Renombrar
                      </button>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 cursor-pointer">
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h4 className="font-black text-dark text-lg mb-2 line-clamp-2 min-h-[3.5rem] leading-tight">
                {doc.nombre}
              </h4>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <Calendar size={12} /> {doc.fecha}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    doc.formato === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {doc.formato}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">{doc.tamaño}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <button className="flex-1 bg-primary text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-secondary transition-all cursor-pointer">
                  <Download size={14} /> Descargar
                </button>
                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-primary transition-all cursor-pointer">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* CARD PARA SUBIR */}
        <div className="border-2 border-dashed border-slate-200 rounded-[32px] p-6 flex flex-col items-center justify-center gap-4 group hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer min-h-[300px]">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-primary group-hover:shadow-lg transition-all">
            <FilePlus size={32} />
          </div>
          <div className="text-center">
            <p className="font-black text-slate-400 group-hover:text-primary transition-colors">Subir Documento</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Estudios Externos</p>
          </div>
        </div>
      </div>
      
      {/* CAPA INVISIBLE PARA CERRAR LOS MENÚS AL DAR CLIC FUERA */}
      {(menuAbiertoId || mostrarMenuFiltro) && (
        <div 
          className="fixed inset-0 z-10 cursor-default" 
          onClick={() => {
            setMenuAbiertoId(null);
            setMostrarMenuFiltro(false);
          }}
        ></div>
      )}
    </div>
  );
};