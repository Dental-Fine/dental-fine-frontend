// src/services/api.js

// Aquí pondremos la URL donde esté corriendo el servidor de Kevin (usualmente localhost:3000 o 8080)
const API_URL = 'http://localhost:8080';
export const ApiService = {
  
  // 1. LOGIN BÁSICO
  // Envía el correo y la contraseña exacta como lo pide el backend
  login: async (correo, contrasena) => {
    try {
      // Le quitamos el /api
      const response = await fetch(`${API_URL}/auth/login`, {
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
  buscarPacientes: async (busqueda) => {
    try {
      // Le quitamos el /api
      const response = await fetch(`${API_URL}/pacientes/buscar?q=${busqueda}`);
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
  },
  // 3. OBTENER TODAS LAS CITAS (¡NUEVO!)
  obtenerCitas: async () => {
    try {
      const response = await fetch(`${API_URL}/citas`);
      return await response.json();
    } catch (error) {
      console.error("Error obteniendo citas:", error);
      return [];
    }
  },

  // 4. CONSULTAR DISPONIBILIDAD (Corregimos la URL quitando el /api)
  consultarDisponibilidad: async (dentistaId, fecha) => {
    try {
      const response = await fetch(`${API_URL}/citas/disponibilidad?dentistaId=${dentistaId}&fecha=${fecha}`);
      return await response.json();
    } catch (error) {
      console.error("Error consultando disponibilidad:", error);
      throw error;
    }
  },

  // 5. AGENDAR CITA (Corregimos la URL quitando el /api)
  agendarCita: async (pacienteId, dentistaId, tipoServicioId, fechaHora) => {
    try {
      const response = await fetch(`${API_URL}/citas/agendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacienteId, dentistaId, tipoServicioId, fechaHora })
      });
      if (!response.ok) {
        // Si Java responde con error (ej. 400 o 500), forzamos a que React lance la alerta
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.mensaje || "Error al agendar la cita. Verifica que los IDs existan.");
      }
      return await response.json();
    } catch (error) {
      console.error("Error agendando cita:", error);
      throw error;
    }
  }
};