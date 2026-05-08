import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { CalendarDays, ClipboardList, WalletCards, LogOut } from 'lucide-react';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Recepción y Agenda', icon: CalendarDays },
    { path: '/dashboard/expedientes', label: 'Expediente Médico', icon: ClipboardList },
    { path: '/dashboard/pagos', label: 'Caja y Pagos', icon: WalletCards },
  ];

  const handleCerrarSesion = () => {
    // 1. Limpiamos cualquier rastro del usuario en la memoria del navegador
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    // 2. Lo mandamos expulsado a la pantalla de Login
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 p-4 gap-4 font-sans">
      <aside className="w-72 bg-white border border-slate-200 rounded-[32px] shadow-sm flex flex-col overflow-hidden">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dental Fine</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all ${
                  isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                }`}>
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <button 
            onClick={handleCerrarSesion}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden p-8">
        <Outlet />
      </main>
    </div>
  );
}