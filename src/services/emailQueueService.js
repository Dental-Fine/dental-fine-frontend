const STORAGE_PLANTILLAS_KEY = 'dental_fine_email_templates_v1';
const STORAGE_COLA_KEY = 'dental_fine_email_queue_v1';
const STORAGE_CONFIG_KEY = 'dental_fine_email_config_v1';

export const VARIABLES_DISPONIBLES = [
  { tag: '{{paciente}}', descripcion: 'Nombre completo del paciente', ejemplo: 'Juan Pérez García' },
  { tag: '{{correo}}', descripcion: 'Correo electrónico del destinatario', ejemplo: 'juan.perez@correo.com' },
  { tag: '{{dentista}}', descripcion: 'Especialista asignado', ejemplo: 'Dra. Elena Solís' },
  { tag: '{{servicio}}', descripcion: 'Tratamiento o servicio dental', ejemplo: 'Limpieza Dental Ultrasónica' },
  { tag: '{{fecha}}', descripcion: 'Fecha de la cita médica', ejemplo: '15 de Noviembre, 2026' },
  { tag: '{{hora}}', descripcion: 'Horario programado', ejemplo: '10:30 hrs' },
  { tag: '{{clinica}}', descripcion: 'Nombre de la sucursal', ejemplo: 'Dental Fine - Clínica Central' },
  { tag: '{{folio}}', descripcion: 'Folio o ID de la cita', ejemplo: '#DF-1042' },
  { tag: '{{notas}}', descripcion: 'Observaciones o indicaciones', ejemplo: 'Asistir 10 minutos antes de la consulta.' }
];

const PLANTILLAS_INICIALES = [
  {
    id: 'CONFIRMACION_CITA',
    nombre: 'Confirmación de Cita Agendada',
    evento: 'Al agendar o confirmar cita',
    asunto: 'Confirmación de tu cita en {{clinica}} - {{fecha}} ({{folio}})',
    encabezado: '¡Tu cita está confirmada!',
    cuerpo:
      'Hola {{paciente}},\n\nTe confirmamos que tu cita para el tratamiento de {{servicio}} con {{dentista}} ha sido programada exitosamente.\n\nFecha: {{fecha}}\nHorario: {{hora}}\nSucursal: {{clinica}}\nFolio de seguimiento: {{folio}}\n\nIndicaciones: {{notas}}',
    piePagina: 'Si necesitas reprogramar o cancelar, por favor avísanos con al menos 24 horas de anticipación.',
    colorAcento: '#4f46e5',
    activa: true,
    actualizadoEn: '2026-11-10T09:00:00'
  },
  {
    id: 'RESUMEN_ATENCION',
    nombre: 'Confirmación de Asistencia y Pase a Historial',
    evento: 'Al confirmar asistencia en recepción (HU05)',
    asunto: 'Resumen de tu consulta en {{clinica}} - Folio {{folio}}',
    encabezado: 'Gracias por confiar en Dental Fine',
    cuerpo:
      'Estimado(a) {{paciente}},\n\nHemos registrado la conclusión de tu consulta en recepción y los detalles han sido trasladados a tu historial clínico.\n\nEspecialista: {{dentista}}\nServicio: {{servicio}}\nFecha de atención: {{fecha}} a las {{hora}}\nObservaciones de cierre: {{notas}}\n\nPuedes consultar tu expediente actualizado desde el Portal de Pacientes.',
    piePagina: 'Dental Fine - Cuidando tu sonrisa con tecnología y calidez.',
    colorAcento: '#10b981',
    activa: true,
    actualizadoEn: '2026-11-10T09:15:00'
  },
  {
    id: 'RECORDATORIO_24H',
    nombre: 'Recordatorio Automático (24h antes)',
    evento: 'Programado 24h antes de la cita',
    asunto: 'Recordatorio: Mañana tienes cita con {{dentista}} a las {{hora}}',
    encabezado: 'Recordatorio de Consulta Dental',
    cuerpo:
      'Hola {{paciente}},\n\nTe recordamos que mañana {{fecha}} a las {{hora}} te esperamos en {{clinica}} para tu sesión de {{servicio}} con {{dentista}}.\n\nNotas adicionales: {{notas}}',
    piePagina: 'Te sugerimos llegar 10 minutos antes para tu registro en recepción.',
    colorAcento: '#0ea5e9',
    activa: true,
    actualizadoEn: '2026-11-10T09:30:00'
  },
  {
    id: 'CANCELACION_CITA',
    nombre: 'Notificación de Cancelación',
    evento: 'Al cancelar cita desde recepción o portal',
    asunto: 'Aviso de cancelación de cita {{folio}} - {{clinica}}',
    encabezado: 'Tu cita ha sido cancelada',
    cuerpo:
      'Hola {{paciente}},\n\nTe informamos que la cita {{folio}} programada para el {{fecha}} a las {{hora}} con {{dentista}} ({{servicio}}) ha sido cancelada en nuestro sistema.\n\nMotivo / Nota: {{notas}}',
    piePagina: 'Puedes agendar un nuevo horario en cualquier momento desde nuestro portal o llamando a recepción.',
    colorAcento: '#ef4444',
    activa: true,
    actualizadoEn: '2026-11-10T09:45:00'
  }
];

const CONFIG_INICIAL = {
  remitenteNombre: 'Dental Fine Clínica Dental',
  remitenteCorreo: 'notificaciones@dentalfine.com',
  servidorSmtp: 'smtp.dentalfine.com:587 (TLS)',
  concurrenciaWorkers: 3,
  maxReintentos: 3,
  intervaloSegundos: 4,
  workerActivo: true,
  encolarAlConfirmarRecepcion: true,
  encolarAlAgendar: true
};

const COLA_INICIAL = [
  {
    id: 'JOB-901',
    plantillaId: 'CONFIRMACION_CITA',
    plantillaNombre: 'Confirmación de Cita Agendada',
    destinatarioNombre: 'María Fernanda López',
    destinatarioCorreo: 'mfernanda.lopez@correo.com',
    asuntoRenderizado: 'Confirmación de tu cita en Dental Fine - Clínica Central - 2026-11-10 (#DF-101)',
    cuerpoRenderizado:
      'Hola María Fernanda López,\n\nTe confirmamos que tu cita para el tratamiento de Limpieza Dental con Dra. Elena Solís ha sido programada exitosamente.\n\nFecha: 2026-11-10\nHorario: 10:00 hrs\nSucursal: Dental Fine - Clínica Central\nFolio de seguimiento: #DF-101\n\nIndicaciones: Asistir 10 minutos antes.',
    prioridad: 'ALTA',
    estado: 'ENVIADO',
    intentos: 1,
    maxIntentos: 3,
    creadoEn: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    procesadoEn: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
    latenciaMs: 340,
    errorDetalle: null
  },
  {
    id: 'JOB-902',
    plantillaId: 'RESUMEN_ATENCION',
    plantillaNombre: 'Confirmación de Asistencia y Pase a Historial',
    destinatarioNombre: 'Carlos Eduardo Ramírez',
    destinatarioCorreo: 'carlos.ramirez@correo.com',
    asuntoRenderizado: 'Resumen de tu consulta en Dental Fine - Clínica Central - Folio #DF-102',
    cuerpoRenderizado:
      'Estimado(a) Carlos Eduardo Ramírez,\n\nHemos registrado la conclusión de tu consulta en recepción y los detalles han sido trasladados a tu historial clínico.\n\nEspecialista: Dr. Roberto Méndez\nServicio: Resina Estética\nFecha de atención: 2026-11-10 a las 11:00 hrs\nObservaciones de cierre: Paciente atendido sin complicaciones.',
    prioridad: 'NORMAL',
    estado: 'EN_COLA',
    intentos: 0,
    maxIntentos: 3,
    creadoEn: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    procesadoEn: null,
    latenciaMs: null,
    errorDetalle: null
  },
  {
    id: 'JOB-903',
    plantillaId: 'RECORDATORIO_24H',
    plantillaNombre: 'Recordatorio Automático (24h antes)',
    destinatarioNombre: 'Ana Sofía Hernández',
    destinatarioCorreo: 'anasofia.hdz@dominio-invalido.test',
    asuntoRenderizado: 'Recordatorio: Mañana tienes cita con Dra. Elena Solís a las 16:00 hrs',
    cuerpoRenderizado:
      'Hola Ana Sofía Hernández,\n\nTe recordamos que mañana a las 16:00 hrs te esperamos en Dental Fine - Clínica Central para tu sesión de Ortodoncia Control.',
    prioridad: 'BAJA',
    estado: 'ERROR',
    intentos: 3,
    maxIntentos: 3,
    creadoEn: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    procesadoEn: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    latenciaMs: 1250,
    errorDetalle: 'SMTP 550 5.1.1: Buzón de destinatario no alcanzable tras 3 reintentos asíncronos.'
  }
];

export const EmailQueueService = {
  obtenerPlantillas: () => {
    try {
      const guardadas = localStorage.getItem(STORAGE_PLANTILLAS_KEY);
      if (guardadas) return JSON.parse(guardadas);
    } catch (e) {
      console.error('Error leyendo plantillas:', e);
    }
    localStorage.setItem(STORAGE_PLANTILLAS_KEY, JSON.stringify(PLANTILLAS_INICIALES));
    return PLANTILLAS_INICIALES;
  },

  guardarPlantilla: (plantillaActualizada) => {
    const plantillas = EmailQueueService.obtenerPlantillas();
    const index = plantillas.findIndex((p) => p.id === plantillaActualizada.id);
    const conFecha = {
      ...plantillaActualizada,
      actualizadoEn: new Date().toISOString()
    };

    if (index >= 0) {
      plantillas[index] = conFecha;
    } else {
      plantillas.push({
        ...conFecha,
        id: conFecha.id || `TPL_${Date.now()}`
      });
    }
    localStorage.setItem(STORAGE_PLANTILLAS_KEY, JSON.stringify(plantillas));
    return plantillas;
  },

  obtenerConfiguracion: () => {
    try {
      const guardada = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (guardada) return { ...CONFIG_INICIAL, ...JSON.parse(guardada) };
    } catch (e) {
      console.error('Error leyendo configuración de cola:', e);
    }
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(CONFIG_INICIAL));
    return CONFIG_INICIAL;
  },

  guardarConfiguracion: (nuevaConfig) => {
    const fusionada = { ...EmailQueueService.obtenerConfiguracion(), ...nuevaConfig };
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(fusionada));
    return fusionada;
  },

  obtenerCola: () => {
    try {
      const guardada = localStorage.getItem(STORAGE_COLA_KEY);
      if (guardada) return JSON.parse(guardada);
    } catch (e) {
      console.error('Error leyendo cola de correos:', e);
    }
    localStorage.setItem(STORAGE_COLA_KEY, JSON.stringify(COLA_INICIAL));
    return COLA_INICIAL;
  },

  guardarCola: (cola) => {
    localStorage.setItem(STORAGE_COLA_KEY, JSON.stringify(cola));
    return cola;
  },

  renderizarTexto: (texto = '', variables = {}) => {
    const valoresPorDefecto = {
      paciente: variables.paciente || 'Juan Pérez García',
      correo: variables.correo || 'paciente@dentalfine.com',
      dentista: variables.dentista || 'Dra. Elena Solís',
      servicio: variables.servicio || 'Consulta Dental General',
      fecha: variables.fecha || new Date().toISOString().split('T')[0],
      hora: variables.hora || '10:30 hrs',
      clinica: variables.clinica || 'Dental Fine - Clínica Central',
      folio: variables.folio || '#DF-1042',
      notas: variables.notas || 'Sin observaciones adicionales.'
    };

    return String(texto)
      .replace(/\{\{paciente\}\}/g, valoresPorDefecto.paciente)
      .replace(/\{\{correo\}\}/g, valoresPorDefecto.correo)
      .replace(/\{\{dentista\}\}/g, valoresPorDefecto.dentista)
      .replace(/\{\{servicio\}\}/g, valoresPorDefecto.servicio)
      .replace(/\{\{fecha\}\}/g, valoresPorDefecto.fecha)
      .replace(/\{\{hora\}\}/g, valoresPorDefecto.hora)
      .replace(/\{\{clinica\}\}/g, valoresPorDefecto.clinica)
      .replace(/\{\{folio\}\}/g, valoresPorDefecto.folio)
      .replace(/\{\{notas\}\}/g, valoresPorDefecto.notas);
  },

  encolarCorreo: ({
    plantillaId = 'CONFIRMACION_CITA',
    variables = {},
    prioridad = 'NORMAL',
    simularError = false
  }) => {
    const plantillas = EmailQueueService.obtenerPlantillas();
    const config = EmailQueueService.obtenerConfiguracion();
    const plantilla = plantillas.find((p) => p.id === plantillaId) || plantillas[0];

    const asuntoRenderizado = EmailQueueService.renderizarTexto(plantilla.asunto, variables);
    const cuerpoRenderizado = EmailQueueService.renderizarTexto(plantilla.cuerpo, variables);

    const nuevoJob = {
      id: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
      plantillaId: plantilla.id,
      plantillaNombre: plantilla.nombre,
      destinatarioNombre: variables.paciente || 'Paciente Dental Fine',
      destinatarioCorreo: variables.correo || 'paciente@dentalfine.com',
      asuntoRenderizado,
      cuerpoRenderizado,
      encabezado: plantilla.encabezado,
      piePagina: plantilla.piePagina,
      colorAcento: plantilla.colorAcento,
      prioridad,
      estado: 'EN_COLA',
      intentos: 0,
      maxIntentos: config.maxReintentos || 3,
      creadoEn: new Date().toISOString(),
      procesadoEn: null,
      latenciaMs: null,
      errorDetalle: null,
      simularError
    };

    const colaActual = EmailQueueService.obtenerCola();
    const nuevaCola = [nuevoJob, ...colaActual];
    EmailQueueService.guardarCola(nuevaCola);
    return nuevoJob;
  },

  reintentarTrabajo: (jobId) => {
    const cola = EmailQueueService.obtenerCola().map((job) => {
      if (job.id === jobId) {
        return {
          ...job,
          estado: 'EN_COLA',
          intentos: 0,
          errorDetalle: null,
          simularError: false
        };
      }
      return job;
    });
    return EmailQueueService.guardarCola(cola);
  },

  eliminarTrabajo: (jobId) => {
    const cola = EmailQueueService.obtenerCola().filter((job) => job.id !== jobId);
    return EmailQueueService.guardarCola(cola);
  },

  limpiarEnviados: () => {
    const cola = EmailQueueService.obtenerCola().filter((job) => job.estado !== 'ENVIADO');
    return EmailQueueService.guardarCola(cola);
  }
};
