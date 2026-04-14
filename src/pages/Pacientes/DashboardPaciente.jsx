
import { Calendar, Clock, Activity, FileText } from 'lucide-react';

export const DashboardPaciente = () => {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-dark">¡Hola, Jesus Guzman!</h2>
          <p className="text-slate-500 mt-1">Bienvenido a tu portal de paciente.</p>
        </div>
        <button className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all flex items-center gap-2 cursor-pointer">
          <Calendar size={20} />
          Nueva Cita
        </button>
      </div>

      {/* Tarjetas de Resumen (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="bg-blue-100 p-3 rounded-lg text-primary">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Próxima Cita</p>
            <p className="text-lg font-bold text-dark mt-1">12 Octubre, 2026</p>
            <p className="text-sm text-primary font-medium mt-1">Limpieza General</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Hora</p>
            <p className="text-lg font-bold text-dark mt-1">10:30 AM</p>
            <p className="text-sm text-slate-400 mt-1">Consultorio 2</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tratamientos Activos</p>
            <p className="text-lg font-bold text-dark mt-1">1 en curso</p>
            <p className="text-sm text-slate-400 mt-1">Ortodoncia</p>
          </div>
        </div>
      </div>

      {/* Historial Reciente */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-dark mb-4">Historial Reciente</h3>
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <FileText size={48} className="mb-4 text-slate-300" />
          <p className="font-medium text-slate-500">Aún no hay registros en tu historial clínico.</p>
          <p className="text-sm mt-1">Tus consultas y tratamientos aparecerán aquí.</p>
        </div>
      </div>
    </div>
  );
};