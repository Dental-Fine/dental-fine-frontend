import { Outlet, Link, useLocation } from 'react-router-dom';
import { CalendarDays, Users, Stethoscope, CreditCard, Settings, LogOut } from 'lucide-react';

export default function MainLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Recepción', icon: CalendarDays },
    { path: '/dashboard/citas', label: 'Gestión de Citas', icon: Users },
    { path: '/dashboard/expediente', label: 'Expediente Médico', icon: Stethoscope },
    { path: '/dashboard/caja', label: 'Caja y Pagos', icon: CreditCard },
  ];

  return (
    <div className="flex h-screen bg-slate-50 p-4 gap-4 font-sans text-slate-800">
      
      {/* Sidebar Flotante Premium */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[32px] shadow-sm flex flex-col overflow-hidden">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dental Fine</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:scale-[1.02]' 
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}