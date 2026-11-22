import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ModalConfiguracionExpediente from './ModalConfiguracionExpediente.jsx';
import { ApiService } from '../../services/api.js';

vi.mock('../../services/api.js', () => ({
  ApiService: {
    actualizarSaludGeneral: vi.fn(),
  },
}));

describe('ModalConfiguracionExpediente (DFI-42) - Pruebas NOM-004 y NOM-013', () => {
  const mockPaciente = {
    id: 10,
    nombre: 'Carlos',
    apellidos: 'Santana Gómez',
    correo: 'carlos@example.com',
    telefono: '7771234567',
    fechaNacimiento: '1990-05-15',
    sexo: 'MASCULINO',
    direccion: 'Av. Morelos #100, Cuernavaca',
    contactoEmergenciaNombre: 'María Gómez',
    contactoEmergenciaTelefono: '7779876543'
  };

  const mockExpediente = {
    id: 5,
    tipoSanguineo: 'O+',
    alergias: 'Penicilina',
    enfermedadesCronicas: 'Ninguna',
    medicamentosActuales: 'Ninguno',
    alergiaAnestesia: true,
    alergiaLatex: false,
    hipertension: true,
    diabetes: false,
    cardiopatias: false,
    problemasCoagulacion: false,
    embarazo: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('No renderiza nada si isOpen es false', () => {
    const { container } = render(
      <ModalConfiguracionExpediente
        isOpen={false}
        onClose={vi.fn()}
        paciente={mockPaciente}
        expediente={mockExpediente}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('Renderiza correctamente la cabecera y alertas médicas NOM-013', () => {
    render(
      <ModalConfiguracionExpediente
        isOpen={true}
        onClose={vi.fn()}
        paciente={mockPaciente}
        expediente={mockExpediente}
      />
    );

    expect(screen.getByText(/Configuración de Expediente Clínico/i)).toBeInTheDocument();
    expect(screen.getByText(/Carlos Santana Gómez/i)).toBeInTheDocument();
    expect(screen.getByText(/Alergia a Anestésicos Locales/i)).toBeInTheDocument();
    expect(screen.getByText(/Hipertensión Arterial/i)).toBeInTheDocument();

    const checkAnestesia = screen.getByLabelText(/Alergia a Anestésicos Locales/i);
    expect(checkAnestesia).toBeChecked();

    const checkHipertension = screen.getByLabelText(/Hipertensión Arterial/i);
    expect(checkHipertension).toBeChecked();

    const checkDiabetes = screen.getByLabelText(/Diabetes Mellitus/i);
    expect(checkDiabetes).not.toBeChecked();
  });

  it('Cambia entre pestañas NOM-013 y NOM-004 Ficha de Identificación', () => {
    render(
      <ModalConfiguracionExpediente
        isOpen={true}
        onClose={vi.fn()}
        paciente={mockPaciente}
        expediente={mockExpediente}
      />
    );

    const tabIdentificacion = screen.getByRole('button', { name: /Ficha de Identificación/i });
    fireEvent.click(tabIdentificacion);

    expect(screen.getByLabelText(/Nombre Completo del Contacto/i)).toHaveValue('María Gómez');
    expect(screen.getByLabelText(/Teléfono de Emergencia/i)).toHaveValue('7779876543');
    expect(screen.getByLabelText(/Calle y Número/i)).toHaveValue('Av. Morelos #100');
  });

  it('Envía los datos correctamente mediante ApiService.actualizarSaludGeneral', async () => {
    const mockOnGuardado = vi.fn();
    const mockOnClose = vi.fn();

    ApiService.actualizarSaludGeneral.mockResolvedValueOnce({
      ...mockExpediente,
      hipertension: false
    });

    render(
      <ModalConfiguracionExpediente
        isOpen={true}
        onClose={mockOnClose}
        paciente={mockPaciente}
        expediente={mockExpediente}
        onGuardadoExitoso={mockOnGuardado}
      />
    );

    const checkHipertension = screen.getByLabelText(/Hipertensión Arterial/i);
    fireEvent.click(checkHipertension);
    expect(checkHipertension).not.toBeChecked();

    const botonGuardar = screen.getByRole('button', { name: /Guardar Cambios Normativos/i });
    fireEvent.click(botonGuardar);

    await waitFor(() => {
      expect(ApiService.actualizarSaludGeneral).toHaveBeenCalledTimes(1);
      expect(mockOnGuardado).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
