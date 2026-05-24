import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Activity, AlertTriangle, Pill, HeartPulse, 
  FileText, Clock, ShieldAlert, Inbox, 
  Stethoscope 
} from 'lucide-react';

// --- COMPONENTE INTERNO: Diente Esquemático de 5 Caras ---
function DienteEsquematico({ numero, condiciones = {} }) {
  const obtenerEstiloCara = (condicion) => {
    if (condicion === 'caries') return 'bg-red-500 border-red-600 z-10';
    if (condicion === 'resin' || condicion === 'resina') return 'bg-blue-500 border-blue-600 z-10';
    return 'bg-white'; // Sano, en paciente portal quitamos hover para que no parezca clickeable
  };

  const caras = [
    { id: 'arriba', label: 'Vestibular', clip: 'polygon(0% 0%, 100% 0%, 75% 25%, 25% 25%)' },
    { id: 'derecha', label: 'Distal', clip: 'polygon(100% 0%, 100% 100%, 75% 75%, 75% 25%)' },
    { id: 'abajo', label: 'Lingual', clip: 'polygon(25% 75%, 75% 75%, 100% 100%, 0% 100%)' },
    { id: 'izquierda', label: 'Mesial', clip: 'polygon(0% 0%, 25% 25%, 25% 75%, 0% 100%)' },
    { id: 'centro', label: 'Oclusal', clip: 'polygon(25% 25%, 75% 25%, 75% 75%, 25% 75%)' }
  ];

  const condicionesDiente = condiciones[numero] || condiciones || {};

  return (
    <div className="flex flex-col items-center gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm cursor-default">
      <span className="text-[10px] font-black text-slate-500 font-sans">{numero}</span>
      <div className="relative w-11 h-11 border-2 border-slate-300 bg-slate-200 rounded-md overflow-hidden">
        {caras.map((cara) => {
          const estadoCara = condicionesDiente[cara.id];
          return (
            <div
              key={cara.id}
              style={{ clipPath: cara.clip }}
              className={`absolute inset-0 border border-slate-300/40 ${obtenerEstiloCara(estadoCara)}`}
              title={`Cara ${cara.label}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export const MiExpediente = () => {
  const [cargando, setCargando] = useState(true);
  const [expediente, setExpediente] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarExpediente = async () => {
      try {
        const usuarioGuardado = JSON.parse(localStorage.getItem('usuario_dental_fine') || '{}');
        const correo = usuarioGuardado.correo;
        
        if (!correo) {
            setError("No se encontró el correo del usuario actual.");
            setCargando(false);
            return;
        }

        const pacientesResp = await api.get('/pacientes');
        const pacienteActual = pacientesResp.data.find(p => p.correo === correo);

        if (!pacienteActual) {
            setError("Tu usuario aún no está enlazado a un perfil de paciente.");
            setCargando(false);
            return;
        }

        // SE CORRIGIÓ EL ERROR DE SINTAXIS AQUÍ USANDO BACKTICKS
        const expResp = await api.get(`/expedientes/paciente/${pacienteActual.id}`);
        setExpediente(expResp.data);
      } catch (err) {
        console.error("Error cargando expediente:", err);
        if (err.response && (err.response.status === 404 || err.response.status === 500)) {
            setExpediente(null);
        } else {
            setError("Ocurrió un error al cargar tu expediente clínico.");
        }
      } finally {
        setCargando(false);
      }
    };
    cargarExpediente();
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-4 shadow-sm">
          <AlertTriangle size={32} />
          <div>
            <h3 className="font-black text-lg">Error</h3>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="bg-slate-50 p-6 rounded-full mb-6">
          <Inbox size={48} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-dark mb-2">Aún no tienes un Expediente Clínico</h2>
        <p className="text-slate-500 font-medium max-w-md">
          Tu dentista creará tu expediente en tu primera cita para registrar tus antecedentes médicos, alergias y plan de tratamiento.
        </p>
      </div>
    );
  }

  const cuadranteSuperiorHemi1 = [18, 17, 16, 15, 14, 13, 12, 11];
  const cuadranteSuperiorHemi2 = [21, 22, 23, 24, 25, 26, 27, 28];
  const cuadranteInferiorHemi4 = [48, 47, 46, 45, 44, 43, 42, 41];
  const cuadranteInferiorHemi3 = [31, 32, 33, 34, 35, 36, 37, 38];
  
  const odontogramaData = expediente.odontograma?.estadoDientes || {};

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider mb-3">
            <Activity size={14} /> Historial Clínico
          </div>
          <h2 className="text-3xl font-black text-dark tracking-tight">Mi Expediente</h2>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <Clock size={16} /> Creado: {new Date(expediente.fechaCreacion).toLocaleDateString('es-ES')}
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary transition-colors cursor-pointer bg-slate-50 px-4 py-2 rounded-xl">
          <FileText size={16} /> Descargar PDF Completo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-6">
          
          <div className="bg-red-50 rounded-3xl border border-red-100 p-6 shadow-sm relative overflow-hidden">
            <ShieldAlert size={100} className="absolute -right-6 -bottom-6 text-red-100/50" />
            <div className="relative z-10">
              <h3 className="text-red-800 font-black flex items-center gap-2 mb-4">
                <AlertTriangle size={20} /> Alergias
              </h3>
              {expediente.alergias ? (
                <p className="text-red-900 font-medium text-lg leading-tight">{expediente.alergias}</p>
              ) : (
                <p className="text-red-700/70 text-sm font-medium">Sin alergias registradas.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-slate-800 font-black flex items-center gap-2 mb-4">
              <HeartPulse size={20} className="text-rose-500" /> Enfermedades Crónicas
            </h3>
            {expediente.enfermedadesCronicas ? (
                <p className="text-slate-600 text-sm leading-relaxed font-medium">{expediente.enfermedadesCronicas}</p>
            ) : (
                <p className="text-slate-400 text-sm font-medium">Ninguna registrada.</p>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-black text-dark mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
              <Stethoscope className="text-primary" /> Evolución de Tratamientos
            </h3>
            
            <div className="space-y-4">
              {expediente.evoluciones && expediente.evoluciones.length > 0 ? (
                expediente.evoluciones.map((evo) => (
                  <div key={evo.id} className="p-4 border border-slate-100 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-slate-800">Cita #{evo.cita?.id || 'N/A'}</h4>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {new Date(evo.fechaRegistro).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{evo.notasClinicas}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 font-medium py-4 text-center">Aún no hay notas de evolución registradas.</p>
              )}
            </div>
            
            <div className="mt-8">
               <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
                 <h3 className="font-bold text-slate-900 text-sm">Odontograma Actualizado</h3>
               </div>
               <div className="space-y-6 py-4 overflow-x-auto">
                 <div className="min-w-max mx-auto px-4 flex flex-col items-center space-y-6">
                 <div className="flex gap-4 border-b border-dashed border-slate-200 pb-5">
                   <div className="flex gap-1">
                     {cuadranteSuperiorHemi1.map(n => (
                       <DienteEsquematico key={n} numero={n} condiciones={odontogramaData} />
                     ))}
                   </div>
                   <div className="w-[1px] bg-slate-200" />
                   <div className="flex gap-1">
                     {cuadranteSuperiorHemi2.map(n => (
                       <DienteEsquematico key={n} numero={n} condiciones={odontogramaData} />
                     ))}
                   </div>
                 </div>
                 <div className="flex gap-4 pt-2">
                   <div className="flex gap-1">
                     {cuadranteInferiorHemi4.map(n => (
                       <DienteEsquematico key={n} numero={n} condiciones={odontogramaData} />
                     ))}
                   </div>
                   <div className="w-[1px] bg-slate-200" />
                   <div className="flex gap-1">
                     {cuadranteInferiorHemi3.map(n => (
                       <DienteEsquematico key={n} numero={n} condiciones={odontogramaData} />
                     ))}
                   </div>
                 </div>
                 </div>
               </div>
               <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-around text-xs font-bold text-slate-500">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white border border-slate-300 rounded" /> Superficie Sana</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded" /> Caries Activa</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded" /> Restaurado (Resina)</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
