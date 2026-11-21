import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Inicio from './Inicio';
import CorreosNotificaciones from './CorreosNotificaciones';
import { EmailQueueService } from '../../services/emailQueueService';

describe('HU05-T02 & HU09-T01 - Recepción y Módulo de Plantillas de Correo (Gmail)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('HU05-T02: Renderiza la vista de recepción con pestañas Agenda Activa e Historial y abre el modal de confirmación', async () => {
    render(
      <MemoryRouter>
        <Inicio />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Panel de Recepción')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Agenda Activa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Historial/i })).toBeInTheDocument();

    const botonesConfirmar = screen.getAllByRole('button', { name: /^Confirmar$/i });
    expect(botonesConfirmar.length).toBeGreaterThan(0);

    fireEvent.click(botonesConfirmar[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirmar Cita')).toBeInTheDocument();
      expect(screen.getByText('Estado de Asistencia *')).toBeInTheDocument();
    });
  });

  it('HU09-T01: Renderiza únicamente las plantillas de correo sin pestaña SMTP ni cola de envíos', async () => {
    render(
      <MemoryRouter>
        <CorreosNotificaciones />
      </MemoryRouter>
    );

    expect(screen.getByText(/Correos y Notificaciones/i)).toBeInTheDocument();
    expect(screen.getByText('Editor de Plantilla')).toBeInTheDocument();
    expect(screen.getByText('Vista Previa Renderizada')).toBeInTheDocument();
    expect(screen.queryByText(/Cola de Envíos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Servicio Externo \(SMTP\)/i)).not.toBeInTheDocument();
  });

  it('DFI-20: Genera el borrador con body por defecto y la URL directa hacia Gmail', () => {
    const resultado = EmailQueueService.enviarConfirmacionCita(
      'paciente@correo.com',
      'Ana Sofía Hernández',
      'Dra. Elena Solís',
      '2026-11-15 a las 10:00 hrs',
      { abrirGmail: false }
    );

    expect(resultado.destinatario).toBe('paciente@correo.com');
    expect(resultado.cuerpo).toContain('Ana Sofía Hernández');
    expect(resultado.cuerpo).toContain('Dra. Elena Solís');
    expect(resultado.urlGmail).toContain('https://mail.google.com/mail/?');
    expect(resultado.urlGmail).toContain('view=cm');
  });
});
