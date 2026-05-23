import React, { useState } from 'react';
import { api } from '../../services/api';
import { FileText, Plus, Trash2, Receipt, AlertCircle, DollarSign } from 'lucide-react';

export const GeneradorTickets = ({ paciente }) => {
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [citaId, setCitaId] = useState('');
  
  // Lista de conceptos para el ticket
  const [detalles, setDetalles] = useState([
    { tipoServicioId: 1, nombre: 'Consulta General', cantidad: 1, precioUnitario: 500 }
  ]);

  // Mock de catálogo de servicios que vendría de base de datos
  const catalogoServicios = [
    { id: 1, nombre: 'Consulta General', precio: 500 },
    { id: 2, nombre: 'Limpieza Dental', precio: 800 },
    { id: 3, nombre: 'Resina Estética', precio: 1200 },
    { id: 4, nombre: 'Extracción Simple', precio: 1500 },
  ];

  const agregarConcepto = () => {
    setDetalles([...detalles, { tipoServicioId: 2, nombre: 'Limpieza Dental', cantidad: 1, precioUnitario: 800 }]);
  };

  const eliminarConcepto = (index) => {
    const nuevos = [...detalles];
    nuevos.splice(index, 1);
    setDetalles(nuevos);
  };

  const actualizarConcepto = (index, campo, valor) => {
    const nuevos = [...detalles];
    nuevos[index][campo] = valor;
    
    if (campo === 'tipoServicioId') {
        const servicio = catalogoServicios.find(s => s.id === parseInt(valor));
        if (servicio) {
            nuevos[index].nombre = servicio.nombre;
            nuevos[index].precioUnitario = servicio.precio;
        }
    }
    setDetalles(nuevos);
  };

  const calcularSubtotal = (detalle) => detalle.cantidad * detalle.precioUnitario;
  const calcularTotal = () => detalles.reduce((acc, det) => acc + calcularSubtotal(det), 0);

  const generarTicket = async () => {
    if (!citaId || detalles.length === 0) return;

    setGuardando(true);
    setMensaje(null);
    try {
      // Formatear payload según el DTO TicketGenerarRequest
      const payload = {
        detalles: detalles.map(d => ({
          tipoServicioId: parseInt(d.tipoServicioId),
          cantidad: parseInt(d.cantidad)
        }))
      };

      await api.post(`/tickets/cita/${citaId}`, payload);
      setMensaje({ tipo: 'exito', texto: 'Ticket de cobro generado y asociado al expediente exitosamente.' });
      setDetalles([{ tipoServicioId: 1, nombre: 'Consulta General', cantidad: 1, precioUnitario: 500 }]);
      setCitaId('');
    } catch (error) {
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error al generar el ticket. El backend no responde.' 
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#E5E5EA]">
        <div>
          <h2 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Emisión de Tickets</h2>
          <p className="text-[#86868B] font-medium mt-1">Genera el cobro por los tratamientos realizados hoy.</p>
        </div>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 border ${mensaje.tipo === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <p className="font-medium">{mensaje.texto}</p>
        </div>
      )}

      <div className="flex gap-8 items-start">
        
        {/* PARTE IZQUIERDA: FORMULARIO */}
        <div className="flex-1 space-y-6">
            <div className="bg-[#F5F5F7] rounded-3xl p-6 border border-[#E5E5EA]">
                <label className="block text-[#1D1D1F] font-semibold mb-2">ID de la Cita</label>
                <input 
                    type="number" 
                    value={citaId}
                    onChange={(e) => setCitaId(e.target.value)}
                    placeholder="ID de Cita (ej. 102)"
                    className="w-full bg-white border border-[#E5E5EA] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:border-blue-500 transition-all font-medium"
                />
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#E5E5EA] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-[#1D1D1F]">Conceptos a Cobrar</h3>
                    <button 
                        onClick={agregarConcepto}
                        className="flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Plus size={16} /> Añadir
                    </button>
                </div>

                <div className="space-y-4">
                    {detalles.map((det, idx) => (
                        <div key={idx} className="flex gap-4 items-center bg-[#F5F5F7] p-4 rounded-2xl border border-[#E5E5EA]">
                            <div className="flex-1">
                                <select 
                                    value={det.tipoServicioId}
                                    onChange={(e) => actualizarConcepto(idx, 'tipoServicioId', e.target.value)}
                                    className="w-full bg-white border border-[#E5E5EA] rounded-lg px-3 py-2 text-[#1D1D1F] focus:outline-none focus:border-blue-500 font-medium"
                                >
                                    {catalogoServicios.map(s => (
                                        <option key={s.id} value={s.id}>{s.nombre} - ${s.precio}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-24">
                                <input 
                                    type="number" 
                                    min="1"
                                    value={det.cantidad}
                                    onChange={(e) => actualizarConcepto(idx, 'cantidad', e.target.value)}
                                    className="w-full bg-white border border-[#E5E5EA] rounded-lg px-3 py-2 text-center font-medium"
                                />
                            </div>
                            <div className="w-24 text-right font-semibold text-[#1D1D1F]">
                                ${calcularSubtotal(det)}
                            </div>
                            <button onClick={() => eliminarConcepto(idx)} className="text-red-400 hover:text-red-600 p-2">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    
                    {detalles.length === 0 && (
                        <p className="text-center text-[#86868B] py-4">No hay conceptos añadidos.</p>
                    )}
                </div>
            </div>
        </div>

        {/* PARTE DERECHA: RESUMEN DEL TICKET */}
        <div className="w-80 bg-[#1D1D1F] rounded-3xl p-8 text-white sticky top-24 shadow-xl">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Receipt className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-6">Resumen de Cobro</h3>
            
            <div className="space-y-4 mb-8">
                {detalles.map((det, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                        <span className="text-[#86868B]">{det.cantidad}x {det.nombre}</span>
                        <span className="font-medium text-white">${calcularSubtotal(det)}</span>
                    </div>
                ))}
            </div>

            <div className="border-t border-white/10 pt-6 mb-8 flex justify-between items-end">
                <span className="text-[#86868B] font-medium">Total (MXN)</span>
                <span className="text-3xl font-semibold tracking-tight">${calcularTotal()}</span>
            </div>

            <button 
                onClick={generarTicket}
                disabled={guardando || detalles.length === 0 || !citaId}
                className="w-full flex justify-center items-center gap-2 bg-blue-500 text-white py-4 rounded-2xl font-semibold hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:hover:bg-blue-500"
            >
                <DollarSign size={20} />
                {guardando ? 'Procesando...' : 'Emitir Ticket'}
            </button>
        </div>

      </div>
    </div>
  );
};
