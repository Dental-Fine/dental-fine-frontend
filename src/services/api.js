import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token_dental_fine');
    if (token) {
      // El estÃ¡ndar de seguridad es mandarlo como "Bearer [token]"
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const esRutaLogin = error.config.url.includes('/auth/login');
    if (error.response && (error.response.status === 401 || error.response.status === 403) && !esRutaLogin) {
      console.warn("SesiÃ³n expirada o token invÃ¡lido. Expulsando usuario...");

      localStorage.removeItem('token_dental_fine');
      localStorage.removeItem('usuario_dental_fine');
      localStorage.removeItem('auth_token');


      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getHeaders = () => {
  const token = localStorage.getItem('token_dental_fine') || localStorage.getItem('auth_token');
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
    return res.filter(p => (p.nombre + " " + (p.apellidos || '')).toLowerCase().includes(query.toLowerCase()) || String(p.id).includes(query));
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

  // === EXPEDIENTES (Conectado al Backend de Kevin) ===
  obtenerExpediente: async (pacienteId) => {
    const response = await fetch(`${BASE_URL}/expedientes/paciente/${pacienteId}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Error al obtener expediente');
    return await response.json();
  },

  actualizarOdontograma: async (expedienteId, estadoDientes) => {
    const response = await fetch(`${BASE_URL}/expedientes/${expedienteId}/odontograma`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ estadoDientes })
    });
    if (!response.ok) throw new Error('Error al actualizar odontograma');
    return await response.json();
  },

  agregarEvolucion: async (expedienteId, citaId, notasClinicas) => {
    const response = await fetch(`${BASE_URL}/expedientes/${expedienteId}/evolucion`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ citaId, notasClinicas })
    });
    if (!response.ok) throw new Error('Error al agregar evolución');
    return await response.json();
  },

  actualizarSaludGeneral: async (pacienteId, alergias, tipoSanguineo, enfermedadesCronicas) => {
    const response = await fetch(`${BASE_URL}/expedientes/paciente/${pacienteId}/salud-general`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ alergias, tipoSanguineo, enfermedadesCronicas })
    });
    if (!response.ok) throw new Error('Error al actualizar salud general');
    return await response.json();
  },

  // === CITAS ===
  obtenerCitas: async () => {
    const response = await fetch(`${BASE_URL}/citas`, { headers: getHeaders() });
    if (!response.ok) {
      console.error("Error al obtener citas. Status:", response.status);
      try { console.error(await response.text()); } catch (e) { }
      return [];
    }
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

  // HU04-T02: Endpoint PUT /api/citas/{id}
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

    let response = await fetch(`${BASE_URL}/api/citas/${idCita}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok && response.status === 404) {
      // Fallback a ruta alternativa si el backend expone /citas/{id}/editar
      response = await fetch(`${BASE_URL}/citas/${idCita}/editar`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al actualizar la cita');
    }
    return await response.json();
  },

  obtenerDisponibilidad: async (dentistaId, fecha) => {
    try {
      let res = await fetch(`${BASE_URL}/api/citas/disponibilidad?dentistaId=${dentistaId}&fecha=${fecha}`, { headers: getHeaders() });
      if (!res.ok) {
        res = await fetch(`${BASE_URL}/citas/disponibilidad?dentistaId=${dentistaId}&fecha=${fecha}`, { headers: getHeaders() });
      }
      if (res.ok) return await res.json();
      return [];
    } catch (e) {
      return [];
    }
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
  },

  crearServicio: async (datos) => {
    const response = await fetch(`${BASE_URL}/servicios`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(datos)
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  },

  actualizarServicio: async (id, datos) => {
    const response = await fetch(`${BASE_URL}/servicios/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(datos)
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  },

  eliminarServicio: async (id) => {
    const response = await fetch(`${BASE_URL}/servicios/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar');
    return true;
  }
};
