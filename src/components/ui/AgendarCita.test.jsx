import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AgendarCita } from './AgendarCita';
import { api } from '../../services/api';

vi.mock('../../services/api');

describe('AgendarCita Component - Pruebas de Integración y Flujo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Caso 4: Carga y muestra los servicios dinámicos desde el Backend', async () => {
    // Mockeamos las respuestas de los catálogos del backend
    api.get.mockImplementation((url) => {
      if (url === '/servicios') {
        return Promise.resolve({
          data: [
            { id: 1, nombre: 'Limpieza Test', descripcion: 'Limpieza profunda' },
            { id: 2, nombre: 'Ortodoncia Test', descripcion: 'Brackets' }
          ]
        });
      }
      if (url === '/dentistas') {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('not found'));
    });

    render(
      <MemoryRouter>
        <AgendarCita />
      </MemoryRouter>
    );

    // Esperamos a que los servicios se carguen y se muestren en el DOM
    await waitFor(() => {
      expect(screen.getByText('Limpieza Test')).toBeInTheDocument();
      expect(screen.getByText('Ortodoncia Test')).toBeInTheDocument();
    });
  });

  it('Caso 5: Permite seleccionar un servicio y avanzar al Paso 2', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/servicios') return Promise.resolve({ data: [{ id: 1, nombre: 'Limpieza Test', descripcion: '' }] });
      if (url === '/dentistas') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <AgendarCita />
      </MemoryRouter>
    );

    // Esperamos a que el servicio aparezca y le damos clic
    await waitFor(() => expect(screen.getByText('Limpieza Test')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Limpieza Test'));

    // Verificamos que el componente avanzó al Paso 2 (Selección de Doctor)
    await waitFor(() => {
      expect(screen.getByText('Elige tu especialista y fecha')).toBeInTheDocument();
    });
  });
});
