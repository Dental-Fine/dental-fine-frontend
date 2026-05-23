import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080', 
  headers: {
    'Content-Type': 'application/json'
  }
});

// 1. Interceptor de Peticiones (Request)
// Se ejecuta ANTES de que la peticiÃ³n salga hacia el Backend.
// Su trabajo es buscar el Token y "pegÃ¡rselo" a la peticiÃ³n.
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

// 2. Interceptor de Respuestas (Response)
// Se ejecuta cuando el Backend nos contesta, ANTES de llegar a tus componentes.
// Su trabajo es atrapar los errores de sesiÃ³n a nivel global.
api.interceptors.response.use(
  (response) => {
    // Si la respuesta fue exitosa (200 OK, 201 Created), la deja pasar normal
    return response;
  },
  (error) => {
    // Si el backend dice "401 Unauthorized" o "403 Forbidden" (El token expirÃ³ o falta)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("SesiÃ³n expirada o token invÃ¡lido. Expulsando usuario...");
      
      // 1. Destruimos la sesiÃ³n local
      localStorage.removeItem('token_dental_fine');
      localStorage.removeItem('usuario_dental_fine');
      
      // 2. Lo mandamos a la calle (Login). 
      // NOTA: Como esto es un archivo puro de JS (no es componente de React), 
      // no podemos usar 'useNavigate', asÃ­ que usamos JS puro:
      window.location.href = '/';
    }
    
    // Si es otro error (como 404 Not Found o 500 Server Error), se lo pasamos al componente
    return Promise.reject(error);
  }
);const BASE_URL = 'http://localhost:8080';

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
