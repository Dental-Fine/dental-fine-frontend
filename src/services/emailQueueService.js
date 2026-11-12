const STORAGE_PLANTILLAS_KEY = 'dental_fine_email_templates_v4';

/**
 * Variables dinámicas sincronizadas con los datos de la cita (EmailService):
 * destinatario, nombrePaciente, doctor, fechaHora
 */
export const VARIABLES_DISPONIBLES = [
  { tag: '{{nombrePaciente}}', descripcion: 'Nombre completo del paciente', ejemplo: 'Juan Pérez García' },
  { tag: '{{destinatario}}', descripcion: 'Correo electrónico del paciente', ejemplo: 'juan.perez@correo.com' },
  { tag: '{{doctor}}', descripcion: 'Doctor / Dentista asignado', ejemplo: 'Dra. Elena Solís' },
  { tag: '{{fechaHora}}', descripcion: 'Fecha y hora de la cita médica', ejemplo: '2026-11-12 a las 10:30 hrs' },
  { tag: '{{servicio}}', descripcion: 'Tratamiento o servicio dental', ejemplo: 'Limpieza Dental Ultrasónica' },
  { tag: '{{clinica}}', descripcion: 'Nombre de la clínica', ejemplo: 'Dental Fine - Clínica Central' },
  { tag: '{{folio}}', descripcion: 'Folio o ID de la cita', ejemplo: '#DF-101' },
  { tag: '{{notas}}', descripcion: 'Observaciones o indicaciones', ejemplo: 'Favor de asistir 10 minutos antes de su cita.' }
];

export const BODY_POR_DEFECTO_CITA =
  'Hola {{nombrePaciente}},\n\nTe saludamos de {{clinica}} para confirmarte los detalles de tu cita dental:\n\n• Especialista: {{doctor}}\n• Tratamiento: {{servicio}}\n• Fecha y hora: {{fechaHora}}\n• Folio: {{folio}}\n\nIndicaciones:\n{{notas}}\n\nSi necesitas reprogramar o tienes alguna duda, puedes responder directamente a este correo.\n\nAtentamente,\n{{doctor}}\n{{clinica}}';

const PLANTILLAS_INICIALES = [
  {
    id: 'CONFIRMACION_CITA',
    nombre: 'Confirmación de Cita Agendada',
    evento: 'Al crear o reprogramar una cita',
    asunto: 'Confirmación de tu cita en {{clinica}} - {{fechaHora}}',
    encabezado: '¡Tu cita está confirmada!',
    cuerpo: BODY_POR_DEFECTO_CITA,
    piePagina: 'Si necesitas reprogramar o cancelar, por favor avísanos con al menos 24 horas de anticipación.',
    colorAcento: '#4f46e5',
    activa: true,
    actualizadoEn: '2026-11-12T09:00:00'
  },
  {
    id: 'RESUMEN_ATENCION',
    nombre: 'Comprobante de Atención',
    evento: 'Al confirmar asistencia en recepción',
    asunto: 'Resumen de tu consulta en {{clinica}} - {{folio}}',
    encabezado: 'Gracias por confiar en Dental Fine',
    cuerpo:
      'Estimado(a) {{nombrePaciente}},\n\nTe compartimos el resumen de tu consulta realizada en {{clinica}}:\n\n• Especialista: {{doctor}}\n• Tratamiento: {{servicio}}\n• Fecha y hora: {{fechaHora}}\n• Folio: {{folio}}\n\nObservaciones del especialista:\n{{notas}}\n\nAtentamente,\n{{doctor}}\n{{clinica}}',
    piePagina: 'Dental Fine - Cuidando tu sonrisa con tecnología y calidez.',
    colorAcento: '#10b981',
    activa: true,
    actualizadoEn: '2026-11-12T09:15:00'
  },
  {
    id: 'RECORDATORIO_24H',
    nombre: 'Recordatorio de Cita',
    evento: 'Recordatorio previo para el paciente',
    asunto: 'Recordatorio de tu cita con {{doctor}} - {{fechaHora}}',
    encabezado: 'Recordatorio de Consulta Dental',
    cuerpo:
      'Hola {{nombrePaciente}},\n\nTe recordamos que tienes una cita programada en {{clinica}}:\n\n• Especialista: {{doctor}}\n• Tratamiento: {{servicio}}\n• Fecha y hora: {{fechaHora}}\n\nIndicaciones:\n{{notas}}\n\n¡Te esperamos!\n{{clinica}}',
    piePagina: 'Te sugerimos llegar 10 minutos antes para tu registro en recepción.',
    colorAcento: '#0ea5e9',
    activa: true,
    actualizadoEn: '2026-11-12T09:30:00'
  },
  {
    id: 'CANCELACION_CITA',
    nombre: 'Notificación de Cancelación',
    evento: 'Al cancelar una cita médica',
    asunto: 'Aviso de cancelación de cita {{folio}} - {{clinica}}',
    encabezado: 'Tu cita ha sido cancelada',
    cuerpo:
      'Hola {{nombrePaciente}},\n\nTe informamos que la cita {{folio}} programada para el {{fechaHora}} con {{doctor}} ({{servicio}}) ha sido cancelada.\n\nMotivo / Observaciones:\n{{notas}}\n\nPuedes comunicarte con nosotros para reagendar cuando gustes.\n\nAtentamente,\n{{clinica}}',
    piePagina: 'Puedes agendar un nuevo horario en cualquier momento desde nuestro portal o llamando a recepción.',
    colorAcento: '#ef4444',
    activa: true,
    actualizadoEn: '2026-11-12T09:45:00'
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

  normalizarVariables: (variables = {}) => {
    const nombrePaciente =
      variables.nombrePaciente || variables.paciente || 'Paciente Dental Fine';
    const destinatario =
      variables.destinatario || variables.correo || 'paciente@correo.com';
    const doctor =
      variables.doctor || variables.dentista || 'Dr(a). Especialista Dental Fine';
    const fecha = variables.fecha || new Date().toISOString().split('T')[0];
    const hora = variables.hora || '10:00 hrs';
    const fechaHora =
      variables.fechaHora || `${fecha} a las ${hora}`;

    return {
      nombrePaciente,
      destinatario,
      doctor,
      fechaHora,
      paciente: nombrePaciente,
      correo: destinatario,
      dentista: doctor,
      servicio: variables.servicio || 'Consulta Dental General',
      fecha,
      hora,
      clinica: variables.clinica || 'Dental Fine - Clínica Central',
      folio: variables.folio || '#DF-101',
      notas:
        variables.notas ||
        'Favor de asistir 10 minutos antes de su cita.'
    };
  },

  renderizarTexto: (texto = '', variables = {}) => {
    const v = EmailQueueService.normalizarVariables(variables);

    return String(texto)
      .replace(/\{\{nombrePaciente\}\}/g, v.nombrePaciente)
      .replace(/\{\{destinatario\}\}/g, v.destinatario)
      .replace(/\{\{doctor\}\}/g, v.doctor)
      .replace(/\{\{fechaHora\}\}/g, v.fechaHora)
      .replace(/\{\{paciente\}\}/g, v.paciente)
      .replace(/\{\{correo\}\}/g, v.correo)
      .replace(/\{\{dentista\}\}/g, v.dentista)
      .replace(/\{\{servicio\}\}/g, v.servicio)
      .replace(/\{\{fecha\}\}/g, v.fecha)
      .replace(/\{\{hora\}\}/g, v.hora)
      .replace(/\{\{clinica\}\}/g, v.clinica)
      .replace(/\{\{folio\}\}/g, v.folio)
      .replace(/\{\{notas\}\}/g, v.notas);
  },

  generarBorradorCorreo: ({ plantillaId = 'CONFIRMACION_CITA', variables = {} } = {}) => {
    const plantillas = EmailQueueService.obtenerPlantillas();
    const plantilla =
      plantillas.find((p) => p.id === plantillaId) || plantillas[0];
    const vars = EmailQueueService.normalizarVariables(variables);

    return {
      plantillaId: plantilla.id,
      plantillaNombre: plantilla.nombre,
      destinatario: vars.destinatario,
      nombrePaciente: vars.nombrePaciente,
      doctor: vars.doctor,
      fechaHora: vars.fechaHora,
      asunto: EmailQueueService.renderizarTexto(plantilla.asunto, vars),
      cuerpo: EmailQueueService.renderizarTexto(
        plantilla.cuerpo || BODY_POR_DEFECTO_CITA,
        vars
      ),
      piePagina: plantilla.piePagina || ''
    };
  },

  construirUrlGmail: ({ destinatario = '', asunto = '', cuerpo = '' } = {}) => {
    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: destinatario.trim(),
      su: asunto,
      body: cuerpo
    });
    return `https://mail.google.com/mail/?${params.toString()}`;
  },

  abrirEnGmail: ({ destinatario = '', asunto = '', cuerpo = '' } = {}) => {
    const urlGmail = EmailQueueService.construirUrlGmail({
      destinatario,
      asunto,
      cuerpo
    });
    if (typeof window !== 'undefined' && typeof window.open === 'function') {
      window.open(urlGmail, '_blank', 'noopener,noreferrer');
    }
    return urlGmail;
  },

  /**
   * Sincronizado con EmailService.enviarConfirmacionCita(destinatario, nombrePaciente, doctor, fechaHora)
   * Genera el correo con body por defecto de la plantilla (o editado) y lo abre directamente en Gmail.
   */
  enviarConfirmacionCita: (
    destinatario,
    nombrePaciente,
    doctor,
    fechaHora,
    opciones = {}
  ) => {
    const borrador = EmailQueueService.generarBorradorCorreo({
      plantillaId: opciones.plantillaId || 'CONFIRMACION_CITA',
      variables: {
        destinatario,
        nombrePaciente,
        doctor,
        fechaHora,
        ...opciones
      }
    });

    const asuntoFinal = opciones.asuntoPersonalizado ?? borrador.asunto;
    const cuerpoFinal = opciones.cuerpoPersonalizado ?? borrador.cuerpo;
    const destinatarioFinal = (opciones.destinatarioPersonalizado ?? borrador.destinatario) || '';

    const urlGmail = EmailQueueService.construirUrlGmail({
      destinatario: destinatarioFinal,
      asunto: asuntoFinal,
      cuerpo: cuerpoFinal
    });

    if (opciones.abrirGmail !== false) {
      EmailQueueService.abrirEnGmail({
        destinatario: destinatarioFinal,
        asunto: asuntoFinal,
        cuerpo: cuerpoFinal
      });
    }

    return {
      destinatario: destinatarioFinal,
      nombrePaciente: borrador.nombrePaciente,
      doctor: borrador.doctor,
      fechaHora: borrador.fechaHora,
      plantillaId: borrador.plantillaId,
      asunto: asuntoFinal,
      cuerpo: cuerpoFinal,
      urlGmail
    };
  }
};
