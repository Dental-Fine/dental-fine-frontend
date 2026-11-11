import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Inicio from './Inicio';
import CorreosNotificaciones from './CorreosNotificaciones';
import { EmailQueueService } from '../../services/emailQueueService';

describe('HU05-T02 & HU09-T01 - Recepción y Cola de Correos', () => {
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

  it('HU09-T01: Renderiza el configurador de plantillas de correo y encola envíos', async () => {
    render(
      <MemoryRouter>
        <CorreosNotificaciones />
      </MemoryRouter>
    );

    expect(screen.getByText(/Correos y Notificaciones/i)).toBeInTheDocument();
    expect(screen.getByText('Editor de Plantilla')).toBeInTheDocument();
    expect(screen.getByText('Vista Previa Renderizada')).toBeInTheDocument();

    const colaAntes = EmailQueueService.obtenerCola().length;
    fireEvent.click(screen.getByRole('button', { name: /Encolar Prueba/i }));

    const colaDespues = EmailQueueService.obtenerCola().length;
    expect(colaDespues).toBe(colaAntes + 1);

    fireEvent.click(screen.getByRole('button', { name: /Cola de Envíos/i }));
    expect(screen.getByRole('button', { name: /Despachar Siguiente Ahora/i })).toBeInTheDocument();
  });
});
