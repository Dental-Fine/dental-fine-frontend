import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Lock, Camera, ShieldCheck, Globe 
} from 'lucide-react';

export const PerfilPaciente = () => {
  // Inicializamos con los datos estáticos que pusiste
  const [perfil, setPerfil] = useState({
    nombre: "Cargando...",
    apellidos: "",
    correo: "correo@ejemplo.com",
    telefono: "Sin registrar",
    fechaNacimiento: "1995-05-20", // Dato estático
    genero: "Masculino", // Dato estático
    calle: "Paseo de los Insurgentes", // Dato estático
    noExterior: "120", // Dato estático
    colonia: "Jardines del Moral", // Dato estático
    cp: "37160", // Dato estático
    ciudad: "León", // Dato estático
    estado: "Guanajuato", // Dato estático
    fechaRegistro: "2024-01-01" // Dato estático
  });

  // Efecto para jalar los datos reales al cargar la página
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario_dental_fine');
    if (usuarioGuardado) {
      const datosReales = JSON.parse(usuarioGuardado);
      
      // Actualizamos el perfil combinando lo estático con lo real que tenemos
      setPerfil(prev => ({
        ...prev,
        // Si el nombre en el mock tiene "Richy Salgado", tratamos de separarlo
        nombre: datosReales.nombre ? datosReales.nombre.split(' ')[0] : 'Alejandro',
        apellidos: datosReales.nombre && datosReales.nombre.split(' ').length > 1 
                   ? datosReales.nombre.split(' ').slice(1).join(' ') 
                   : 'Pérez',
        correo: "richysalgado123@gmail.com", // El que insertaste en SQL
        telefono: "5512345678" // El que insertaste en SQL
      }));
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-8">
      
      {/* HEADER: Perfil Visual */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-primary"></div> {/* Banner color sólido */}
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12">
            <div className="relative">
              <div className="h-32 w-32 rounded-2xl border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-md">
                <User size={64} className="text-slate-300" />
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-primary hover:bg-slate-50 transition-colors cursor-pointer">
                <Camera size={18} />
              </button>
            </div>
            <div className="mb-2">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck size={14} /> Paciente Activo
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <h2 className="text-2xl font-black text-dark">{perfil.nombre} {perfil.apellidos}</h2>
            <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
              <Calendar size={14} /> Miembro desde: {perfil.fechaRegistro}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Seguridad y Cuenta */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-black text-dark flex items-center gap-2 mb-4">
              <Lock size={18} className="text-primary" /> Seguridad
            </h3>
            <button className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-dark text-sm font-bold rounded-xl transition-colors mb-3 cursor-pointer">
              Cambiar Contraseña
            </button>
            <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-widest">
              Último acceso: Hoy, 10:45
            </p>
          </div>

          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <h3 className="font-black text-primary flex items-center gap-2 mb-2 text-sm">
              <Globe size={18} /> Mi Clínica
            </h3>
            <p className="text-dark font-bold">Dental Fine - Central</p>
            <p className="text-xs text-slate-500 mt-1">Zona Horaria: UTC-6</p>
          </div>
        </div>

        {/* COLUMNA DERECHA: Formulario de Datos */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-dark mb-6 pb-2 border-b border-slate-100">
              Información del Paciente
            </h3>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Grid de inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nombre(s)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" value={perfil.nombre} readOnly className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-700" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Apellidos</label>
                  <input type="text" value={perfil.apellidos} readOnly className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-700" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="email" value={perfil.correo} readOnly className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-700" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Teléfono Principal</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" value={perfil.telefono} readOnly className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-700" />
                  </div>
                </div>
              </div>

              <h4 className="font-black text-dark text-sm pt-4 flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> Dirección de Contacto
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Calle</label>
                  <input type="text" defaultValue={perfil.calle} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">No. Ext</label>
                  <input type="text" defaultValue={perfil.noExterior} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">CP</label>
                  <input type="text" defaultValue={perfil.cp} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Ciudad</label>
                  <input type="text" defaultValue={perfil.ciudad} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Estado</label>
                  <input type="text" defaultValue={perfil.estado} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button type="button" className="bg-primary hover:bg-secondary text-white px-10 py-3 rounded-xl font-black shadow-lg shadow-primary/30 transition-all cursor-pointer opacity-50">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};