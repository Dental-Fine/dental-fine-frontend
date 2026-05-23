import React, { useState } from 'react';
import { Search, User, ChevronLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Importaremos los subcomponentes clínicos (que crearemos en el siguiente paso)
import { OdontogramaEditor } from '../../components/clinico/OdontogramaEditor';
import { FormularioEvolucion } from '../../components/clinico/FormularioEvolucion';
import { GeneradorTickets } from '../../components/clinico/GeneradorTickets';

export const GestorClinico = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [tabActivo, setTabActivo] = useState('odontograma'); // odontograma | evolucion | cobro

  const buscarPaciente = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;
    
    try {
      // Petición real al backend
      const { data } = await api.get(`/pacientes`);
      const pacienteEncontrado = data.find(p => 
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
        p.correo?.toLowerCase().includes(busqueda.toLowerCase())
      );

      if (pacienteEncontrado) {
        setPacienteSeleccionado(pacienteEncontrado);
      } else {
        alert("No se encontró ningún paciente con ese nombre o correo.");
      }
    } catch (error) {
      console.error("Error buscando paciente:", error);
      alert("Error al conectar con la base de datos.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans">
      
      {/* NAVBAR CLÍNICO */}
      <div className="bg-white border-b border-[#E5E5EA] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors font-medium"
          >
            <ChevronLeft size={20} /> Volver
          </button>
          <h1 className="text-lg font-semibold text-[#1D1D1F]">Gestor Clínico</h1>
          <div className="w-20"></div> {/* Spacer para centrar título */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* BUSCADOR DE PACIENTES */}
        {!pacienteSeleccionado && (
          <div className="max-w-2xl mx-auto mt-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <User size={40} className="text-blue-500" />
            </div>
            <h2 className="text-[32px] font-semibold text-[#1D1D1F] tracking-tight mb-2">
              Buscar Paciente
            </h2>
            <p className="text-[#86868B] text-lg mb-8">
              Ingresa el nombre, apellido o correo para abrir su expediente.
            </p>
            
            <form onSubmit={buscarPaciente} className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={20} />
              <input 
                type="text" 
                placeholder="Ej. Juan Pérez..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white border border-[#E5E5EA] rounded-full text-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>
        )}

        {/* WORKSPACE CLÍNICO (CUANDO HAY PACIENTE SELECCIONADO) */}
        {pacienteSeleccionado && (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* SIDEBAR DEL PACIENTE */}
            <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
              
              {/* Patient Card */}
              <div className="bg-white rounded-3xl p-6 border border-[#E5E5EA] shadow-sm">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  {pacienteSeleccionado.nombre.charAt(0)}
                </div>
                <h2 className="text-xl font-semibold text-[#1D1D1F]">
                  {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellidos}
                </h2>
                <p className="text-[#86868B] text-sm mt-1">{pacienteSeleccionado.correo}</p>
                <p className="text-[#86868B] text-sm mt-1">{pacienteSeleccionado.telefono}</p>
                
                <button 
                  onClick={() => setPacienteSeleccionado(null)}
                  className="w-full mt-6 py-2 bg-[#F5F5F7] text-[#1D1D1F] font-medium rounded-xl hover:bg-[#E5E5EA] transition-colors"
                >
                  Cambiar Paciente
                </button>
              </div>

              {/* Menú Lateral */}
              <div className="bg-white rounded-3xl p-4 border border-[#E5E5EA] shadow-sm flex flex-col gap-2">
                <button 
                  onClick={() => setTabActivo('odontograma')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${tabActivo === 'odontograma' ? 'bg-blue-50 text-blue-600' : 'text-[#86868B] hover:bg-[#F5F5F7]'}`}
                >
                  <Search size={20} /> Odontograma
                </button>
                <button 
                  onClick={() => setTabActivo('evolucion')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${tabActivo === 'evolucion' ? 'bg-blue-50 text-blue-600' : 'text-[#86868B] hover:bg-[#F5F5F7]'}`}
                >
                  <FileText size={20} /> Evolución
                </button>
                <button 
                  onClick={() => setTabActivo('cobro')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${tabActivo === 'cobro' ? 'bg-blue-50 text-blue-600' : 'text-[#86868B] hover:bg-[#F5F5F7]'}`}
                >
                  <Calendar size={20} /> Generar Cobro
                </button>
              </div>

            </div>

            {/* ÁREA DE TRABAJO PRINCIPAL */}
            <div className="flex-1">
              <div className="bg-white rounded-3xl p-8 border border-[#E5E5EA] shadow-sm min-h-[600px]">
                {tabActivo === 'odontograma' && <OdontogramaEditor pacienteId={pacienteSeleccionado.id} />}
                {tabActivo === 'evolucion' && <FormularioEvolucion pacienteId={pacienteSeleccionado.id} />}
                {tabActivo === 'cobro' && <GeneradorTickets paciente={pacienteSeleccionado} />}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
