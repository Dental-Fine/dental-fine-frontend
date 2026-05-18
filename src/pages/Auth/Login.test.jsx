import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';
import { api } from '../../services/api';

// Mock de la API y de useNavigate
vi.mock('../../services/api');
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component - Pruebas de Software (Clases de Equivalencia y Valores al Límite)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  it('Caso 1: Renderiza el formulario de inicio de sesión correctamente', () => {
    renderLogin();
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ejemplo@correo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('Caso 2 (Clase de Equivalencia - Válida): Inicio de sesión exitoso', async () => {
    // Simulamos una respuesta exitosa del Backend
    api.post.mockResolvedValueOnce({
      data: {
        token: 'fake-jwt-token',
        usuario: { id: 1, nombre: 'Paciente Test', rol: 'PACIENTE' }
      }
    });

    renderLogin();

    // Llenamos datos válidos
    fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), { target: { value: 'test@correo.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    
    // Enviamos formulario
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Verificamos que se llamó a la API correctamente
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@correo.com',
        password: 'password123'
      });
      // Verificamos redirección
      expect(mockNavigate).toHaveBeenCalledWith('/paciente/inicio');
      // Verificamos LocalStorage
      expect(localStorage.getItem('token_dental_fine')).toBe('fake-jwt-token');
    });
  });

  it('Caso 3 (Valor al Límite / Inválido): Credenciales incorrectas o servidor rechaza (401)', async () => {
    // Simulamos un error 401 del Backend
    api.post.mockRejectedValueOnce({
      response: { status: 401 }
    });

    renderLogin();

    // Llenamos datos erróneos
    fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), { target: { value: 'wrong@correo.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });
    
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Verificamos que aparezca el mensaje de error en pantalla
    await waitFor(() => {
      expect(screen.getByText('Correo o contraseña incorrectos.')).toBeInTheDocument();
    });
  });
});
