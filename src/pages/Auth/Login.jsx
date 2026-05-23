import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, Stethoscope } from 'lucide-react';
import { ApiService } from '../../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      // Intentamos iniciar sesión contra el servidor de Spring Boot
      const respuesta = await ApiService.login(correo, contrasena);
      
      // Si Java nos da un token de acceso, lo guardamos y entramos
      if (respuesta && respuesta.token) {
        localStorage.setItem('auth_token', respuesta.token);
        localStorage.setItem('rol', respuesta.usuario.rol);
        navigate('/dashboard'); // Redirección exitosa
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (err) {
      setError("Correo o contraseña incorrectos. Verifica tus accesos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100 p-10">
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/30">
            <Stethoscope size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dental Fine</h1>
          <p className="text-slate-500 font-medium mt-2">Acceso exclusivo para personal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in shake">
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="email" 
                required 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="recepcion@dentalfine.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="password" 
                required 
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all font-medium"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
          >
            {cargando ? <><Loader2 className="animate-spin" size={20}/> Conectando...</> : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-8 font-semibold">
          ¿Olvidaste tu contraseña? Contacta al administrador del sistema.
        </p>
      </div>
    </div>
  );
}