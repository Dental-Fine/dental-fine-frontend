// src/services/api.js

// Aquí pondremos la URL donde esté corriendo el servidor de Kevin (usualmente localhost:3000 o 8080)
const API_URL = 'http://localhost:3000'; 

export const ApiService = {
  
  // 1. LOGIN BÁSICO
  // Envía el correo y la contraseña exacta como lo pide el backend
  login: async (correo, contrasena) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });
      return await response.json();
    } catch (error) {
      console.error("Error en el Login:", error);
      throw error;
    }
  },

  // 2. BUSCAR PACIENTES
  // Retorna [{ idPaciente, nombre, apellidos, telefono }]
  buscarPacientes: async (busqueda) => {
    try {
      const response = await fetch(`${API_URL}/api/pacientes/buscar?q=${busqueda}`);
      return await response.json();
    } catch (error) {
      console.error("Error buscando pacientes:", error);
      throw error;
    }
  },

  // 3. CONSULTAR DISPONIBILIDAD
  // Retorna [{ horaInicio, horaFin, disponible }]
  consultarDisponibilidad: async (dentistaId, fecha) => {
    try {
      const response = await fetch(`${API_URL}/api/citas/disponibilidad?dentistaId=${dentistaId}&fecha=${fecha}`);
      return await response.json();
    } catch (error) {
      console.error("Error consultando disponibilidad:", error);
      throw error;
    }
  },

  // 4. AGENDAR CITA
  // Une la fecha y hora en el formato "YYYY-MM-DDTHH:MM:SS" que pide el backend
  agendarCita: async (pacienteId, dentistaId, tipoServicioId, fechaHora) => {
    try {
      const response = await fetch(`${API_URL}/api/citas/agendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pacienteId, 
          dentistaId, 
          tipoServicioId, 
          fechaHora // Ej: "2026-04-15T10:00:00"
        })
      });
      return await response.json();
    } catch (error) {
      console.error("Error agendando cita:", error);
      throw error;
    }
  }
};