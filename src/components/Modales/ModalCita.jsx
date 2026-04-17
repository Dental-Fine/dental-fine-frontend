import { X, Calendar, Clock, User, Stethoscope, FileText, CheckCircle2 } from 'lucide-react';

export default function ModalCita({ isOpen, onClose, citaEditando }) {
  if (!isOpen) return null;

  // Si hay una citaEditando, cambiamos el título
  const titulo = citaEditando ? 'Actualizar Cita' : 'Nueva Cita Rápida';
  const textoBoton = citaEditando ? 'Guardar Cambios' : 'Agendar Cita';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{titulo}</h2>
            <p className="text-slate-500 text-sm">Alineado con la tabla 'Citas' de la BD.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-all">
            <X size={24} />
          </button>
        </div>

        <form className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* id_paciente */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                <User size={16} className="text-indigo-600" /> ID Paciente
              </label>
              <input 
                type="number" 
                defaultValue={citaEditando?.id_paciente || ""}
                placeholder="Ej: 10"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            {/* id_dentista */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                <Stethoscope size={16} className="text-indigo-600" /> ID Dentista
              </label>
              <input 
                type="number" 
                defaultValue={citaEditando?.id_dentista || ""}
                placeholder="Ej: 5"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            {/* fecha */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-600" /> Fecha
              </label>
              <input type="date" defaultValue={citaEditando?.fecha || ""} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none" />
            </div>

            {/* estado */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-600" /> Estado
              </label>
              <select defaultValue={citaEditando?.estado || "Pendiente"} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none">
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Atendida">Atendida</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            {/* hora */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                <Clock size={16} className="text-indigo-600" /> Hora Inicio
              </label>
              <input type="time" defaultValue={citaEditando?.hora || ""} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none" />
            </div>

            {/* hora_fin */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                <Clock size={16} className="text-indigo-600" /> Hora Fin
              </label>
              <input type="time" defaultValue={citaEditando?.hora_fin || ""} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" /> Observaciones
            </label>
            <textarea rows="2" defaultValue={citaEditando?.observaciones || ""} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none resize-none" />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancelar</button>
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20">{textoBoton}</button>
          </div>
        </form>
      </div>
    </div>
  );
}