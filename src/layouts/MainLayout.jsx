import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, CreditCard, LogOut, Activity, Menu } from 'lucide-react';
import logoDentalFine from '../assets/DentalFine_Logo.png'; 

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  // Función para cerrar sesión con seguridad
  const handleLogout = () => {
    if(window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.removeItem('auth_token'); // Borramos el token de Java
      localStorage.removeItem('token_dental_fine');
      localStorage.removeItem('usuario_dental_fine');
      localStorage.removeItem('rol');
      navigate('/login'); // Expulsamos al Login
    }
  };

  const navItemClass = (path) => {
    const isActive = location.pathname === path || (path !== '/admin/dashboard' && location.pathname.startsWith(path));
    return `w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all text-sm overflow-hidden relative cursor-pointer ${
      isActive 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
        : 'hover:bg-slate-800 hover:text-white text-slate-400'
    }`;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* MENÚ LATERAL (SIDEBAR) */}
      <div className={`bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 transition-all duration-300 ease-in-out relative ${isExpanded ? 'w-72' : 'w-24'}`}>
        
        {/* LOGO DE DENTAL FINE */}
        <div className="h-24 border-b border-slate-800 flex items-center relative overflow-hidden">
          
          {/* Logo - Centrado cuando colapsado */}
          <div 
            onClick={() => !isExpanded && setIsExpanded(true)}
            className={`absolute flex items-center overflow-hidden h-10 transition-all duration-300 ease-in-out bg-white rounded-lg p-1 ${isExpanded ? 'left-6 w-12 cursor-default' : 'left-1/2 -translate-x-1/2 w-10 cursor-pointer'}`}
            title={!isExpanded ? "Expandir menú" : ""}
          >
            <img 
              src={logoDentalFine} 
              alt="Dental Fine" 
              className="h-full w-full object-contain" 
            />
          </div>

          {/* Texto del Logo */}
          <div className={`absolute left-20 ml-2 transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
             <h2 className="text-white font-black text-base tracking-tight">Dental Fine</h2>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Panel Recepción</p>
          </div>

          {/* Botón Hamburguesa */}
          <button 
            onClick={() => setIsExpanded(false)}
            className={`absolute right-4 p-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-all duration-300 ease-in-out cursor-pointer z-10 ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
            title="Colapsar menú"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* ENLACES DE NAVEGACIÓN */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-2 custom-scrollbar">
          
          {/* SECCIÓN: PRINCIPAL */}
          <p className={`pl-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 transition-all duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden m-0'}`}>
            Principal
          </p>
          
          <button onClick={() => navigate('/admin/dashboard')} className={navItemClass('/admin/dashboard')} title={!isExpanded ? "Inicio" : ""}>
            <div className="min-w-[20px] flex justify-center"><Home size={20} className={location.pathname === '/admin/dashboard' ? 'text-indigo-200' : 'text-slate-500'} /></div>
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 ml-2' : 'opacity-0 ml-0 w-0'}`}>
              Inicio
            </span>
          </button>
          
          {/* SECCIÓN: CLÍNICO */}
          <p className={`pl-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 transition-all duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden m-0'}`}>
            Clínico
          </p>
          
          <button onClick={() => navigate('/admin/servicios')} className={navItemClass('/admin/servicios')} title={!isExpanded ? "Servicios" : ""}>
            <div className="min-w-[20px] flex justify-center"><Activity size={20} className={location.pathname.startsWith('/admin/servicios') ? 'text-indigo-200' : 'text-slate-500'} /></div>
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 ml-2' : 'opacity-0 ml-0 w-0'}`}>
              Servicios
            </span>
          </button>

          <button onClick={() => navigate('/admin/expedientes')} className={navItemClass('/admin/expedientes')} title={!isExpanded ? "Expedientes Médicos" : ""}>
            <div className="min-w-[20px] flex justify-center"><Users size={20} className={location.pathname.startsWith('/admin/expedientes') ? 'text-indigo-200' : 'text-slate-500'} /></div>
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 ml-2' : 'opacity-0 ml-0 w-0'}`}>
              Expedientes Médicos
            </span>
          </button>

          {/* SECCIÓN: ADMINISTRATIVO */}
          <p className={`pl-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 transition-all duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden m-0'}`}>
            Administrativo
          </p>
          
          <button onClick={() => navigate('/admin/pagos')} className={navItemClass('/admin/pagos')} title={!isExpanded ? "Caja y Pagos" : ""}>
            <div className="min-w-[20px] flex justify-center"><CreditCard size={20} className={location.pathname.startsWith('/admin/pagos') ? 'text-indigo-200' : 'text-slate-500'} /></div>
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 ml-2' : 'opacity-0 ml-0 w-0'}`}>
              Caja y Pagos
            </span>
          </button>

        </nav>

        {/* PERFIL Y LOGOUT */}
        <div className="p-6 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 ${isExpanded ? 'px-4' : 'px-2 justify-center'} py-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group text-sm overflow-hidden`}
            title={!isExpanded ? "Cerrar Sesión" : ""}
          >
            <div className="min-w-[20px] flex justify-center">
                <LogOut size={20} className={isExpanded ? 'group-hover:-translate-x-1 transition-transform' : ''} />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 ml-2' : 'opacity-0 ml-0 w-0 hidden'}`}>
              Cerrar Sesión
            </span>
          </button>
        </div>

      </div>

      {/* CONTENIDO DINÁMICO DE LAS PÁGINAS */}
      <div className="flex-1 h-screen overflow-hidden bg-slate-50 flex flex-col">
        <Outlet />
      </div>

    </div>
  );
}