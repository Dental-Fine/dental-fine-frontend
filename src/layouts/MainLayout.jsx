import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, CreditCard, LogOut, Activity } from 'lucide-react';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✨ MENU ACTUALIZADO: Quitamos 'Agenda Citas' y agregamos 'Servicios'
  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Inicio' },
    { path: '/dashboard/servicios', icon: Activity, label: 'Servicios' },
    { path: '/dashboard/expedientes', icon: Users, label: 'Expedientes Médicos' },
    { path: '/dashboard/pagos', icon: CreditCard, label: 'Caja y Pagos' }
  ];

  // Función para cerrar sesión con seguridad
  const handleLogout = () => {
    if(window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.removeItem('auth_token'); // Borramos el token de Java
      localStorage.removeItem('rol');
      navigate('/login'); // Expulsamos al Login
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* MENÚ LATERAL (SIDEBAR) */}
      <div className="w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20">
        
        {/* LOGO DE DENTAL FINE */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-600/30">
            DF
          </div>
          <div>
            <h2 className="text-white font-black text-base tracking-tight">Dental Fine</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Panel Recepción</p>
          </div>
        </div>

        {/* ENLACES DE NAVEGACIÓN */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Validamos si la ruta está activa para pintarlo de azul
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all text-sm ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-indigo-200' : 'text-slate-500'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* PERFIL Y LOGOUT */}
        <div className="p-6 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group text-sm"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            Cerrar Sesión
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