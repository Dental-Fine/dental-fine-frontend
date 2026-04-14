import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Activity, CreditCard, FolderOpen, User, LogOut, Menu } from 'lucide-react';

// Importamos tu logo
import logoDentalFine from '../assets/DentalFine_Logo.png'; 

export const PortalPacienteLayout = ({ children }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  // Función de clases optimizada para animaciones suaves
  const navItemClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center pl-6 py-3.5 text-sm font-bold transition-colors duration-200 overflow-hidden relative ${
      isActive 
        ? 'bg-primary text-white border-l-4 border-secondary' 
        : 'text-slate-800 hover:bg-slate-100 border-l-4 border-transparent'
    }`;
  };

  return (
    <div className="flex h-screen bg-background font-sans text-slate-800">
      
      <aside className={`bg-white border-r border-slate-200 flex flex-col shadow-sm transition-all duration-300 ease-in-out relative ${isExpanded ? 'w-64' : 'w-20'}`}>
        
        <div className="h-20 border-b border-slate-100 flex items-center relative overflow-hidden">
          
          {/* El Logo: Se centra y se vuelve botón cuando el menú está cerrado */}
          <div 
            onClick={() => !isExpanded && setIsExpanded(true)}
            className={`absolute flex items-center overflow-hidden h-9 transition-all duration-300 ease-in-out ${isExpanded ? 'left-5 w-36 cursor-default' : 'left-1/2 -translate-x-1/2 w-9 cursor-pointer'}`}
            title={!isExpanded ? "Expandir menú" : ""}
          >
            <img 
              src={logoDentalFine} 
              alt="Dental Fine" 
              className="h-full w-auto max-w-none" 
            />
          </div>

          {/* Botón Hamburguesa: Desaparece suavemente cuando se cierra el menú */}
          <button 
            onClick={() => setIsExpanded(false)}
            className={`absolute right-4 p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary transition-all duration-300 ease-in-out cursor-pointer z-10 ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
            title="Colapsar menú"
          >
            <Menu size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 py-4">
          
          {/* Subtítulo Principal */}
          <p className={`pl-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 transition-all duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden m-0'}`}>
            Principal
          </p>
          
          <Link to="/paciente/inicio" className={navItemClass('/paciente/inicio')}>
            <div className="min-w-[24px] flex justify-center"><Home size={20} /></div>
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 ml-3 w-32' : 'opacity-0 ml-0 w-0'}`}>
              Inicio
            </span>
          </Link>
          
          <Link to="/paciente/citas" className={navItemClass('/paciente/citas')}>
            <div className="min-w-[24px] flex justify-center"><Calendar size={20} /></div>
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 ml-3 w-32' : 'opacity-0 ml-0 w-0'}`}>
              Mis Citas
            </span>
          </Link>
          
          {/* Subtítulo Clínico */}
          <p className={`pl-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4 transition-all duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden m-0'}`}>
            Clínico
          </p>
          
          <Link to="/paciente/expediente" className={navItemClass('/paciente/expediente')}>
            <div className="min-w-[24px] flex justify-center"><Activity size={20} /></div>
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 ml-3 w-32' : 'opacity-0 ml-0 w-0'}`}>
              Mi Expediente
            </span>
          </Link>

          <Link to="/paciente/documentos" className={navItemClass('/paciente/documentos')}>
            <div className="min-w-[24px] flex justify-center"><FolderOpen size={20} /></div>
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 ml-3 w-32' : 'opacity-0 ml-0 w-0'}`}>
              Documentos
            </span>
          </Link>

          {/* Subtítulo Administrativo */}
          <p className={`pl-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4 transition-all duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden m-0'}`}>
            Administrativo
          </p>
          
          <Link to="/paciente/pagos" className={navItemClass('/paciente/pagos')}>
            <div className="min-w-[24px] flex justify-center"><CreditCard size={20} /></div>
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 ml-3 w-32' : 'opacity-0 ml-0 w-0'}`}>
              Mis Pagos
            </span>
          </Link>
          
          <Link to="/paciente/perfil" className={navItemClass('/paciente/perfil')}>
            <div className="min-w-[24px] flex justify-center"><User size={20} /></div>
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 ml-3 w-32' : 'opacity-0 ml-0 w-0'}`}>
              Mi Perfil
            </span>
          </Link>
        </nav>

        {/* === BOTÓN DE CERRAR SESIÓN === */}
        <div className="border-t border-slate-200">
          <button className="flex items-center pl-6 pr-4 py-4 text-slate-600 hover:text-red-600 hover:bg-red-50 w-full font-bold transition-colors duration-200 overflow-hidden cursor-pointer">
            <div className="min-w-[24px] flex justify-center"><LogOut size={20} /></div>
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 ml-3 w-32' : 'opacity-0 ml-0 w-0'}`}>
              Cerrar Sesión
            </span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {children}
      </main>

    </div>
  );
};