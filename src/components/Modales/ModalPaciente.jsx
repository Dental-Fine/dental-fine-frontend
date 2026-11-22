import { useState, useEffect } from 'react';
import { 
  X, User, Phone, Mail, Droplet, AlertCircle, FileText, 
  Loader2, CheckCircle2, Calendar, MapPin, Users, PhoneCall 
} from 'lucide-react';
import { ApiService } from '../../services/api';

export default function ModalPaciente({ isOpen, onClose, pacienteEditando, onGuardarExitoso }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('MASCULINO');
  const [direccion, setDireccion] = useState('');
  const [contactoEmergenciaNombre, setContactoEmergenciaNombre] = useState('');
  const [contactoEmergenciaTelefono, setContactoEmergenciaTelefono] = useState('');
  const [tipoSanguineo, setTipoSanguineo] = useState('O+');
  const [alergias, setAlergias] = useState('');
  const [antecedentes, setAntecedentes] = useState('');

  // Cargar datos si se va a editar un paciente existente
  useEffect(() => {
    if (isOpen && pacienteEditando) {
      setNombre(pacienteEditando.nombre || '');
      setApellidos(pacienteEditando.apellidos || '');
      setTelefono(pacienteEditando.telefono || '');
      setCorreo(pacienteEditando.correo || '');
      setFechaNacimiento(pacienteEditando.fechaNacimiento || '');
      setSexo(pacienteEditando.sexo || 'MASCULINO');
      setDireccion(pacienteEditando.direccion || '');
      setContactoEmergenciaNombre(pacienteEditando.contactoEmergenciaNombre || '');
      setContactoEmergenciaTelefono(pacienteEditando.contactoEmergenciaTelefono || '');
      setTipoSanguineo(pacienteEditando.tipoSanguineo || 'O+');
      setAlergias(pacienteEditando.alergias || '');
      setAntecedentes(pacienteEditando.antecedentes || '');
    } else {
      // Limpiar formulario si es un registro nuevo
      setNombre('');
      setApellidos('');
      setTelefono('');
      setCorreo('');
      setFechaNacimiento('');
      setSexo('MASCULINO');
      setDireccion('');
      setContactoEmergenciaNombre('');
      setContactoEmergenciaTelefono('');
      setTipoSanguineo('O+');
      setAlergias('');
      setAntecedentes('');
    }
    setError('');
    setExito(false);
  }, [isOpen, pacienteEditando]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    // Estructura de datos completa alineada con NOM-004 y entidades Spring Boot
    const datosPaciente = {
      nombre,
      apellidos,
      telefono,
      correo,
      fechaNacimiento: fechaNacimiento || null,
      sexo,
      direccion,
      contactoEmergenciaNombre,
      contactoEmergenciaTelefono,
      tipoSanguineo,
      alergias,
      antecedentes
    };

    try {
      let pacienteIdTarget;
      if (pacienteEditando) {
        // Lógica para actualizar paciente existente
        await ApiService.actualizarPaciente(pacienteEditando.id, datosPaciente);
        pacienteIdTarget = pacienteEditando.id;
      } else {
        // Lógica para crear paciente nuevo (crea Usuario y Paciente en BD)
        const nuevoPaciente = await ApiService.crearPaciente(datosPaciente);
        pacienteIdTarget = nuevoPaciente.id;
      }

      // Actualizar Salud General en el Expediente asociado (NOM-004 / NOM-013)
      try {
        await ApiService.actualizarSaludGeneral(pacienteIdTarget, {
          alergias,
          tipoSanguineo,
          enfermedadesCronicas: antecedentes,
          fechaNacimiento: fechaNacimiento || null,
          sexo,
          direccion,
          contactoEmergenciaNombre,
          contactoEmergenciaTelefono
        });
      } catch (errSalud) {
        console.warn("Error al actualizar salud general, pero el paciente se guardó.", errSalud);
      }

      setExito(true);
      setTimeout(() => {
        setExito(false);
        if (onGuardarExitoso) onGuardarExitoso();
        onClose(); // Cierra el modal y refresca la lista
      }, 1500);

    } catch (err) {
      console.error("Error al guardar paciente:", err);
      setError(err.message || "El servidor rechazó el registro. Verifica que el correo no esté repetido.");
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* CABECERA */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {pacienteEditando ? 'Modificar Expediente' : 'Registrar Nuevo Paciente'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">Ficha de identificación y clínica conforme a NOM-004-SSA3-2012.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* CUERPO */}
        <div className="overflow-y-auto p-8 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {exito ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Guardado Exitoso!</h3>
              <p className="text-slate-500 text-sm">El expediente clínico se ha sincronizado en PostgreSQL.</p>
            </div>
          ) : (
            <form id="pacienteForm" onSubmit={handleSubmit} className="space-y-6">
              
              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">
                Datos Personales de Identificación
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><User size={16} /> Nombre(s) *</label>
                  <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-sm" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><User size={16} /> Apellidos *</label>
                  <input type="text" required value={apellidos} onChange={e => setApellidos(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-sm" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Phone size={16} /> Teléfono Celular *</label>
                  <input type="tel" required value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-sm" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Mail size={16} /> Correo Electrónico *</label>
                  <input type="email" required value={correo} onChange={e => setCorreo(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-sm" placeholder="ejemplo@dentalfine.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Calendar size={16} /> Fecha de Nacimiento</label>
                  <input type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-sm" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Users size={16} /> Sexo / Género</label>
                  <select value={sexo} onChange={e => setSexo(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-sm bg-slate-50">
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro / No binario</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><MapPin size={16} /> Domicilio Completo (Calle, Número, Colonia, CP)</label>
                  <input type="text" placeholder="Ej. Av. Hidalgo #123, Col. Centro, CP 38980" value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-sm" />
                </div>
              </div>

              {/* CONTACTO DE EMERGENCIA NOM-004 */}
              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2 pt-2">
                Contacto Responsable de Emergencia (Obligatorio NOM-004)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><User size={16} /> Nombre del Contacto</label>
                  <input type="text" placeholder="Ej. María Moreno Salgado (Familiar)" value={contactoEmergenciaNombre} onChange={e => setContactoEmergenciaNombre(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-sm" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><PhoneCall size={16} /> Teléfono de Emergencia (10 dígitos)</label>
                  <input type="tel" placeholder="Ej. 4451234567" value={contactoEmergenciaTelefono} onChange={e => setContactoEmergenciaTelefono(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-sm font-mono" />
                </div>
              </div>

              {/* HISTORIAL CLÍNICO NOM-013 */}
              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2 pt-2">
                Historial Clínico Inicial (NOM-013)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Droplet size={16} /> Factor RH / Tipo de Sangre</label>
                  <select value={tipoSanguineo} onChange={e => setTipoSanguineo(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-sm bg-slate-50">
                    <option value="O+">O Positivo (O+)</option>
                    <option value="O-">O Negativo (O-)</option>
                    <option value="A+">A Positivo (A+)</option>
                    <option value="A-">A Negativo (A-)</option>
                    <option value="B+">B Positivo (B+)</option>
                    <option value="B-">B Negativo (B-)</option>
                    <option value="AB+">AB Positivo (AB+)</option>
                    <option value="AB-">AB Negativo (AB-)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><AlertCircle size={16} /> Alergias Conocidas</label>
                  <input type="text" placeholder="Ej. Penicilina, Látex, AINES..." value={alergias} onChange={e => setAlergias(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-sm" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><FileText size={16} /> Padecimientos Crónicos / Antecedentes</label>
                  <textarea rows="3" value={antecedentes} onChange={e => setAntecedentes(e.target.value)} placeholder="Hipertensión, diabetes, cirugías, tratamientos previos..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 resize-none text-sm leading-relaxed" />
                </div>
              </div>

            </form>
          )}
        </div>

        {/* ACCIONES */}
        {!exito && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 mt-auto sticky bottom-0 z-10">
            <button type="button" onClick={onClose} disabled={cargando} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 text-sm transition-colors cursor-pointer">
              Cancelar
            </button>
            <button form="pacienteForm" type="submit" disabled={cargando} className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 text-sm transition-all active:scale-98 cursor-pointer">
              {cargando ? <><Loader2 className="animate-spin" size={18} /> Guardando...</> : 'Guardar Paciente'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
