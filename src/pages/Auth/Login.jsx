import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, 
  ShieldCheck, Sparkles
} from 'lucide-react';

// === PASO 1: IMPORTA TU LOGO PNG ===
// Asegúrate de que la ruta coincida con donde guardaste el archivo
import logoDentalFine from '../../assets/DentalFine_Logo.png'; 

export const Login = () => {
  const navigate = useNavigate();
  
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      navigate('/paciente/inicio');
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      
      {/* LADO IZQUIERDO: Panel Corporativo (Igual, manteniendo el badge de texto) */}
      <div className="hidden lg:flex w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-black/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-md p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] shadow-2xl text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Sparkles size={14} className="text-blue-200" />
            Portal Oficial de Pacientes
          </div>
          <h2 className="text-4xl font-black mb-4 leading-tight">Tu sonrisa en las mejores manos.</h2>
          <p className="text-white/80 font-medium leading-relaxed mb-8">Accede a tu portal para gestionar tus citas, revisar tu expediente clínico y descargar tus documentos médicos de forma 100% segura.</p>
          <div className="flex items-center gap-3 pt-6 border-t border-white/20 text-sm font-bold text-white/90">
            <ShieldCheck size={20} className="text-green-300" />
            Conexión encriptada y segura
          </div>
        </div>
      </div>

      {/* LADO DERECHO: Formulario de Login */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* LOGO Y ENCABEZADO ACTUALIZADO */}
          <div className="text-center">
            
            {/* === PASO 2: REEMPLAZA EL LOGO DE TEXTO POR LA IMAGEN === */}
            <div className="flex justify-center mb-10"> {/* Aumentamos el margen inferior */}
              <img 
                src={logoDentalFine} // Usamos la imagen importada
                alt="Logo Dental Fine" 
                className="h-24 w-auto drop-shadow-sm" // Controlamos la altura (h-24 = 96px) y mantenemos proporción
              />
            </div>

            <h1 className="text-2xl font-black text-dark tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-slate-500 font-medium mt-2">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Formulario (Mismo código...) */}
          <form onSubmit={handleLogin} className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Correo Electrónico</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail size={20} />
                </div>
                <input type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="ejemplo@correo.com" className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-medium text-slate-700 transition-all"/>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock size={20} />
                </div>
                <input type={mostrarPass ? "text" : "password"} required value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="••••••••" className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-medium text-slate-700 transition-all"/>
                <button type="button" onClick={() => setMostrarPass(!mostrarPass)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                  {mostrarPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-end pt-1"><a href="#" className="text-xs font-bold text-primary hover:text-secondary transition-colors">¿Olvidaste tu contraseña?</a></div>
            </div>
            <button type="submit" disabled={cargando} className={`w-full py-4 rounded-2xl font-black text-white shadow-xl shadow-primary/30 flex items-center justify-center gap-2 transition-all cursor-pointer ${cargando ? 'bg-primary/80 scale-[0.98]' : 'bg-primary hover:bg-secondary hover:scale-[1.02]'}`}>
              {cargando ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><ArrowRight size={20} /> Iniciar Sesión</>}
            </button>
          </form>
        </div>
        <div className="absolute bottom-8 text-center text-xs font-bold text-slate-400">© 2026 Dental Fine. Todos los derechos reservados.</div>
      </div>
    </div>
  );
};