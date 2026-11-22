import { useState, useEffect } from 'react';
import { 
  X, Save, AlertTriangle, Heart, ShieldAlert, 
  UserCheck, FileText, Activity, Phone, MapPin, 
  Calendar, Loader2, CheckCircle2 
} from 'lucide-react';
import { ApiService } from '../../services/api.js';

export function descomponerDireccion(direccionCompleta = '') {
  if (!direccionCompleta) {
    return { calle: '', colonia: '', codigoPostal: '', municipio: '', estado: '' };
  }

  const partes = direccionCompleta.split(',').map(p => p.trim());
  let calle = '';
  let colonia = '';
  let codigoPostal = '';
  let municipio = '';
  let estado = '';

  const matchCP = direccionCompleta.match(/C\.?P\.?\s*(\d{5})/i) || direccionCompleta.match(/\b(\d{5})\b/);
  if (matchCP) {
    codigoPostal = matchCP[1];
  }

  const matchCol = direccionCompleta.match(/Col(?:onia)?\.?\s*([^,]+)/i);
  if (matchCol) {
    colonia = matchCol[1].trim();
  }

  if (partes.length >= 4) {
    calle = partes[0] || '';
    if (!colonia && partes[1]) colonia = partes[1].replace(/^Col\.?\s*/i, '');
    municipio = partes[partes.length - 2] || '';
    estado = partes[partes.length - 1] || '';
  } else if (partes.length === 1) {
    calle = partes[0];
  } else {
    calle = partes[0] || '';
    if (partes.length > 1 && !colonia) colonia = partes[1];
    if (partes.length > 2 && !municipio) municipio = partes[2];
    if (partes.length > 3 && !estado) estado = partes[3];
  }

  return { calle, colonia, codigoPostal, municipio, estado };
}

export function componerDireccion({ calle = '', colonia = '', codigoPostal = '', municipio = '', estado = '' }) {
  const partes = [];
  if (calle && calle.trim()) partes.push(calle.trim());
  if (colonia && colonia.trim()) partes.push(`Col. ${colonia.trim()}`);
  if (codigoPostal && codigoPostal.trim()) partes.push(`C.P. ${codigoPostal.trim()}`);
  if (municipio && municipio.trim()) partes.push(municipio.trim());
  if (estado && estado.trim()) partes.push(estado.trim());
  return partes.join(', ');
}

export default function ModalConfiguracionExpediente({
  isOpen,
  onClose,
  paciente,
  expediente,
  onGuardadoExitoso
}) {
  const [tabActiva, setTabActiva] = useState('alertas'); // 'identificacion' | 'alertas'
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Partes descompuestas de la dirección (NOM-004)
  const [direccionPartes, setDireccionPartes] = useState({
    calle: '',
    colonia: '',
    codigoPostal: '',
    municipio: '',
    estado: ''
  });

  // Estado del Formulario
  const [formData, setFormData] = useState({
    // Ficha de Identificación NOM-004
    fechaNacimiento: '',
    sexo: 'MASCULINO',
    direccion: '',
    contactoEmergenciaNombre: '',
    contactoEmergenciaTelefono: '',

    // Antecedentes y Alertas NOM-013
    tipoSanguineo: 'O+',
    alergias: '',
    enfermedadesCronicas: '',
    medicamentosActuales: '',
    alergiaAnestesia: false,
    alergiaLatex: false,
    hipertension: false,
    diabetes: false,
    cardiopatias: false,
    problemasCoagulacion: false,
    embarazo: false
  });

  useEffect(() => {
    if (paciente || expediente) {
      const direccionInicial = paciente?.direccion || '';
      setDireccionPartes(descomponerDireccion(direccionInicial));

      setFormData({
        fechaNacimiento: paciente?.fechaNacimiento || '',
        sexo: paciente?.sexo || 'MASCULINO',
        direccion: direccionInicial,
        contactoEmergenciaNombre: paciente?.contactoEmergenciaNombre || '',
        contactoEmergenciaTelefono: paciente?.contactoEmergenciaTelefono || '',

        tipoSanguineo: expediente?.tipoSanguineo || paciente?.tipoSanguineo || 'O+',
        alergias: expediente?.alergias || '',
        enfermedadesCronicas: expediente?.enfermedadesCronicas || '',
        medicamentosActuales: expediente?.medicamentosActuales || '',
        alergiaAnestesia: Boolean(expediente?.alergiaAnestesia),
        alergiaLatex: Boolean(expediente?.alergiaLatex),
        hipertension: Boolean(expediente?.hipertension),
        diabetes: Boolean(expediente?.diabetes),
        cardiopatias: Boolean(expediente?.cardiopatias),
        problemasCoagulacion: Boolean(expediente?.problemasCoagulacion),
        embarazo: Boolean(expediente?.embarazo)
      });
      setErrorMsg('');
    }
  }, [paciente, expediente, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDireccionPartesChange = (e) => {
    const { name, value } = e.target;
    setDireccionPartes(prev => {
      const actualizadas = { ...prev, [name]: value };
      const direccionCompleta = componerDireccion(actualizadas);
      setFormData(f => ({ ...f, direccion: direccionCompleta }));
      return actualizadas;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paciente?.id && !paciente?.idPaciente) {
      setErrorMsg('No se localizó el identificador del paciente.');
      return;
    }

    setGuardando(true);
    setErrorMsg('');

    const pacienteId = paciente.id || paciente.idPaciente;
    const direccionFinal = componerDireccion(direccionPartes);
    const payload = {
      ...formData,
      direccion: direccionFinal
    };

    try {
      const expedienteActualizado = await ApiService.actualizarSaludGeneral(pacienteId, payload);

      const pacienteActualizado = {
        ...paciente,
        fechaNacimiento: formData.fechaNacimiento,
        sexo: formData.sexo,
        direccion: direccionFinal,
        contactoEmergenciaNombre: formData.contactoEmergenciaNombre,
        contactoEmergenciaTelefono: formData.contactoEmergenciaTelefono,
        tipoSanguineo: formData.tipoSanguineo
      };

      if (onGuardadoExitoso) {
        onGuardadoExitoso(expedienteActualizado, pacienteActualizado);
      }
      onClose();
    } catch (err) {
      console.error('Error al guardar expediente clínico:', err);
      setErrorMsg('No se pudo guardar la configuración del expediente en el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl backdrop-blur-md">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Configuración de Expediente Clínico</h3>
              <p className="text-xs text-indigo-300">
                Cumplimiento normativo NOM-004-SSA3-2012 y NOM-013-SSA2-2015 | {paciente?.nombre} {paciente?.apellidos}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={guardando}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* PESTAÑAS NAVEGACIÓN - SEGMENTED CONTROL */}
        <div className="px-6 pt-5 pb-1 bg-white">
          <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-2 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setTabActiva('alertas')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tabActiva === 'alertas'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldAlert size={16} className={tabActiva === 'alertas' ? 'text-indigo-600' : 'text-slate-400'} />
              Alertas Médicas y Odontológicas (NOM-013)
            </button>

            <button
              type="button"
              onClick={() => setTabActiva('identificacion')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tabActiva === 'identificacion'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck size={16} className={tabActiva === 'identificacion' ? 'text-indigo-600' : 'text-slate-400'} />
              Ficha de Identificación y Emergencia (NOM-004)
            </button>
          </div>
        </div>

        {/* MENSAJE DE ERROR */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: ALERTAS MÉDICAS ESTOMATOLÓGICAS */}
          {tabActiva === 'alertas' && (
            <div className="space-y-6">
              
              {/* Banner Informativo */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>Evaluación de Riesgo Clínico:</strong> Las condiciones marcadas aquí alertarán al dentista sobre restricciones anestésicas (ej. epinefrina en hipertensos), requerimiento de profilaxis antibiótica o riesgo de hemorragia antes de intervenciones quirúrgicas.
                </p>
              </div>

              {/* TIPO DE SANGRE Y ALERGIAS PRINCIPALES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo Sanguíneo y Factor Rh *
                  </label>
                  <select
                    name="tipoSanguineo"
                    value={formData.tipoSanguineo}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
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

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alergias a Medicamentos / Sustancias
                  </label>
                  <input
                    type="text"
                    name="alergias"
                    value={formData.alergias}
                    onChange={handleChange}
                    placeholder="Ej. Penicilina, Amoxicilina, Aspirina, Ibuprofeno..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* FACTORES DE RIESGO ODONTOLÓGICO (CHECKBOXES) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Condiciones de Alto Riesgo en Sillón Dental (NOM-013)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Alergia Anestésicos */}
                  <label className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    formData.alergiaAnestesia 
                      ? 'bg-red-50 border-red-300 text-red-900 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}>
                    <div>
                      <p className="text-xs font-bold">Alergia a Anestésicos Locales</p>
                      <p className="text-[10px] text-slate-500">Lidocaína, Mepivacaína, etc.</p>
                    </div>
                    <input
                      type="checkbox"
                      name="alergiaAnestesia"
                      checked={formData.alergiaAnestesia}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                  </label>

                  {/* Hipertensión */}
                  <label className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    formData.hipertension 
                      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}>
                    <div>
                      <p className="text-xs font-bold">Hipertensión Arterial</p>
                      <p className="text-[10px] text-slate-500">Restringe vasoconstrictores/epinefrina</p>
                    </div>
                    <input
                      type="checkbox"
                      name="hipertension"
                      checked={formData.hipertension}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                  </label>

                  {/* Diabetes */}
                  <label className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    formData.diabetes 
                      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}>
                    <div>
                      <p className="text-xs font-bold">Diabetes Mellitus</p>
                      <p className="text-[10px] text-slate-500">Riesgo infeccioso y cicatrización lenta</p>
                    </div>
                    <input
                      type="checkbox"
                      name="diabetes"
                      checked={formData.diabetes}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                  </label>

                  {/* Coagulación */}
                  <label className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    formData.problemasCoagulacion 
                      ? 'bg-red-50 border-red-300 text-red-900 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}>
                    <div>
                      <p className="text-xs font-bold">Anticoagulantes / Hemorragias</p>
                      <p className="text-[10px] text-slate-500">Toma de aspirina o heparina</p>
                    </div>
                    <input
                      type="checkbox"
                      name="problemasCoagulacion"
                      checked={formData.problemasCoagulacion}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                  </label>

                  {/* Cardiopatías */}
                  <label className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    formData.cardiopatias 
                      ? 'bg-red-50 border-red-300 text-red-900 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}>
                    <div>
                      <p className="text-xs font-bold">Cardiopatía / Marcapasos / Soplos</p>
                      <p className="text-[10px] text-slate-500">Requiere profilaxis antibiótica</p>
                    </div>
                    <input
                      type="checkbox"
                      name="cardiopatias"
                      checked={formData.cardiopatias}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                  </label>

                  {/* Alergia Látex */}
                  <label className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    formData.alergiaLatex 
                      ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}>
                    <div>
                      <p className="text-xs font-bold">Alergia al Látex</p>
                      <p className="text-[10px] text-slate-500">Exige guantes de nitrilo / vinil</p>
                    </div>
                    <input
                      type="checkbox"
                      name="alergiaLatex"
                      checked={formData.alergiaLatex}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                    />
                  </label>

                  {/* Embarazo */}
                  <label className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between sm:col-span-2 ${
                    formData.embarazo 
                      ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}>
                    <div>
                      <p className="text-xs font-bold">Paciente en Estado de Embarazo</p>
                      <p className="text-[10px] text-slate-500">Restricción de toma radiográfica periapical y medicamentos teratogénicos</p>
                    </div>
                    <input
                      type="checkbox"
                      name="embarazo"
                      checked={formData.embarazo}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                  </label>

                </div>
              </div>

              {/* MEDICAMENTOS Y PADECIMIENTOS ADICIONALES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medicamentos que Consume Actualmente
                  </label>
                  <textarea
                    name="medicamentosActuales"
                    value={formData.medicamentosActuales}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Ej. Losartán 50mg c/24h, Metformina 850mg..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Otras Enfermedades Crónicas o Cirugías Previas
                  </label>
                  <textarea
                    name="enfermedadesCronicas"
                    value={formData.enfermedadesCronicas}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Ej. Asma, insuficiencia renal, cirugía de bypass..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: FICHA DE IDENTIFICACIÓN NOM-004 */}
          {tabActiva === 'identificacion' && (
            <div className="space-y-6">
              
              <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-2xl flex items-start gap-3">
                <UserCheck className="text-slate-700 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Requerimiento NOM-004-SSA3-2012 (Numeral 5.1):</strong> La ficha de identificación clínica exige fecha de nacimiento para trazabilidad etaria, dirección verificable y un contacto responsable ante contingencias médicas.
                </p>
              </div>

              {/* FECHA NACIMIENTO Y GÉNERO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fechaNacimiento" className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      id="fechaNacimiento"
                      type="date"
                      name="fechaNacimiento"
                      value={formData.fechaNacimiento}
                      onChange={handleChange}
                      className="w-full pl-9 rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sexo" className="block text-xs font-bold text-slate-700 mb-1">
                    Sexo / Género
                  </label>
                  <select
                    id="sexo"
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro / No binario</option>
                  </select>
                </div>
              </div>

              {/* DOMICILIO ESTRUCTURADO NOM-004 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={14} className="text-indigo-600" />
                  Domicilio del Paciente (NOM-004)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="calle" className="block text-xs font-bold text-slate-700 mb-1">
                      Calle y Número (Ext./Int.) *
                    </label>
                    <input
                      id="calle"
                      type="text"
                      name="calle"
                      value={direccionPartes.calle}
                      onChange={handleDireccionPartesChange}
                      placeholder="Ej. Av. Hidalgo #123 Int. 4"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="colonia" className="block text-xs font-bold text-slate-700 mb-1">
                      Colonia / Fraccionamiento
                    </label>
                    <input
                      id="colonia"
                      type="text"
                      name="colonia"
                      value={direccionPartes.colonia}
                      onChange={handleDireccionPartesChange}
                      placeholder="Ej. Centro"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="codigoPostal" className="block text-xs font-bold text-slate-700 mb-1">
                      Código Postal (5 dígitos)
                    </label>
                    <input
                      id="codigoPostal"
                      type="text"
                      maxLength={5}
                      name="codigoPostal"
                      value={direccionPartes.codigoPostal}
                      onChange={handleDireccionPartesChange}
                      placeholder="Ej. 38980"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="municipio" className="block text-xs font-bold text-slate-700 mb-1">
                      Municipio o Alcaldía
                    </label>
                    <input
                      id="municipio"
                      type="text"
                      name="municipio"
                      value={direccionPartes.municipio}
                      onChange={handleDireccionPartesChange}
                      placeholder="Ej. Uriangato"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="estado" className="block text-xs font-bold text-slate-700 mb-1">
                      Estado / Entidad Federativa
                    </label>
                    <input
                      id="estado"
                      type="text"
                      name="estado"
                      value={direccionPartes.estado}
                      onChange={handleDireccionPartesChange}
                      placeholder="Ej. Guanajuato"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* CONTACTO DE EMERGENCIA */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Phone size={14} className="text-indigo-600" />
                  Contacto Responsable de Emergencia (Obligatorio NOM-004)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactoEmergenciaNombre" className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre Completo del Contacto
                    </label>
                    <input
                      id="contactoEmergenciaNombre"
                      type="text"
                      name="contactoEmergenciaNombre"
                      value={formData.contactoEmergenciaNombre}
                      onChange={handleChange}
                      placeholder="Ej. María Moreno Salgado (Madre/Esposa)"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactoEmergenciaTelefono" className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono de Emergencia (10 dígitos)
                    </label>
                    <input
                      id="contactoEmergenciaTelefono"
                      type="tel"
                      name="contactoEmergenciaTelefono"
                      value={formData.contactoEmergenciaTelefono}
                      onChange={handleChange}
                      placeholder="Ej. 4451234567"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* FOOTER ACCIONES */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-100 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {guardando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando Expediente...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar Cambios Normativos
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
