const BASE_URL = 'http://localhost:8080';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const ApiService = {

  // === PACIENTES ===
  obtenerPacientes: async () => {
    const response = await fetch(`${BASE_URL}/pacientes`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Error al obtener pacientes');
    return await response.json();
  },
  
  buscarPacientes: async (query) => {
    const res = await ApiService.obtenerPacientes();
    return res.filter(p => (p.nombre + " " + (p.apellidos||'')).toLowerCase().includes(query.toLowerCase()) || String(p.id).includes(query));
  },
  
  obtenerPacientePorId: async (id) => {
    const response = await fetch(`${BASE_URL}/pacientes/${id}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Error al obtener paciente');
    return await response.json();
  },
  
  crearPaciente: async (datos) => {
    const response = await fetch(`${BASE_URL}/pacientes`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(datos) });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  },
  
  actualizarPaciente: async (id, datos) => {
    const response = await fetch(`${BASE_URL}/pacientes/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(datos) });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  },
  
  eliminarPaciente: async (id) => {
    const response = await fetch(`${BASE_URL}/pacientes/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!response.ok) throw new Error('Error al eliminar');
    return true;
  },

  // === CITAS ===
  obtenerCitas: async () => {
    const response = await fetch(`${BASE_URL}/citas`, { headers: getHeaders() });
    if (!response.ok) return [];
    return await response.json();
  },

  agendarCita: async (pacienteId, dentistaId, tipoServicioId, fechaHora) => {
    const inicio = new Date(fechaHora);
    const fin = new Date(inicio.getTime() + 30 * 60000);
    const formatISO = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19);

    const payload = {
      pacienteId: parseInt(pacienteId),
      dentistaId: parseInt(dentistaId),
      fechaHoraInicio: fechaHora, 
      fechaHoraFin: formatISO(fin)
    };

    const response = await fetch(`${BASE_URL}/citas/agendar`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(await response.text() || 'Error al agendar la cita');
    return await response.json();
  },

  // ✨ NUEVO: Método para conectarse al botón EDITAR de Spring Boot
  editarCita: async (idCita, pacienteId, dentistaId, tipoServicioId, fechaHora) => {
    const inicio = new Date(fechaHora);
    const fin = new Date(inicio.getTime() + 30 * 60000);
    const formatISO = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19);

    const payload = {
      pacienteId: parseInt(pacienteId),
      dentistaId: parseInt(dentistaId),
      fechaHoraInicio: fechaHora, 
      fechaHoraFin: formatISO(fin)
    };

    const response = await fetch(`${BASE_URL}/citas/${idCita}/editar`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(await response.text() || 'Error al actualizar la cita');
    return await response.json();
  },

  cancelarCita: async (idCita) => {
    const response = await fetch(`${BASE_URL}/citas/${idCita}/cancelar`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ rolUsuario: "ROLE_RECEPCION", motivoCancelacion: "Cancelación desde Recepción" }) 
    });
    if (!response.ok) throw new Error('Error al cancelar');
    return await response.json();
  },

  // === CATÁLOGOS ===
  obtenerDentistas: async () => {
    try {
      const response = await fetch(`${BASE_URL}/dentistas`, { headers: getHeaders() });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : (data.content || []);
    } catch (error) { return []; }
  },

  obtenerServicios: async () => {
    try {
      const response = await fetch(`${BASE_URL}/servicios`, { headers: getHeaders() });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : (data.content || []);
    } catch (error) { return []; }
  }
};