# Frontend Specification: Dental Fine (React SPA)

## 1. Project Overview & Architecture
**Dental Fine Frontend** es la interfaz de usuario (SPA - Single Page Application) del portal para pacientes y personal de la clínica dental.
- **Patrón Arquitectónico:** Basado en Componentes (Pages para vistas completas, y subcarpeta `components/ui` para elementos reutilizables como Modales y Cards).
- **Enrutamiento:** Client-side routing para una navegación sin recargas, mejorando la experiencia del usuario (UX).
- **Gestión de Estado:** Estado local con `useState`/`useEffect` y uso de `localStorage` para persistencia de sesión en la fase MVP.

## 2. Tech Stack & Dependencies
- **Framework Core:** React.js (v18+) empaquetado con Vite para un HMR (Hot Module Replacement) ultrarrápido.
- **Estilos y UI:** Tailwind CSS (utility-first framework) para diseño responsivo y moderno.
- **Enrutador:** React Router DOM.
- **Cliente HTTP:** Axios configurado en `src/services/api.js` para peticiones centralizadas al backend.
- **Iconografía:** Lucide React (iconos vectoriales ligeros y consistentes).

## 3. Security & Auth Configuration
- **Autenticación (Estado MVP):** Bypass de seguridad. El login crea un objeto estático `usuario_dental_fine` en el `localStorage` con un ID de paciente falso (ej. ID: 1) para permitir el flujo de pruebas.
  > [!NOTE]
  > MVP Status: En espera del endpoint JWT del backend para reemplazar el mock por un flujo de token real e implementar `ProtectedRoutes`.
- **CORS:** El cliente Axios apunta a `http://localhost:8080/` (configurable vía variables de entorno).

## 4. Core Views & Flow (Portal Paciente)
- **`Inicio.jsx`:** Dashboard principal. Recupera el nombre del usuario desde `localStorage` y muestra resumen de actividad.
- **`MisCitas.jsx`:** Listado histórico y próximo de citas. Implementa filtros locales y botón de cancelación (invoca `PUT /citas/{id}/estado`).
- **`AgendarCita.jsx`:** Formulario tipo "Wizard" (Paso a paso).
  - *Paso 1:* Selección de servicio (Mocked).
  - *Paso 2:* Selección de Dentista y búsqueda de disponibilidad (Fetch real a `GET /citas/disponibilidad`).
  - *Paso 3 y 4:* Confirmación y POST a `/citas/agendar`.
- **`PerfilPaciente.jsx`:** Formulario de solo lectura (en MVP) que fusiona datos estáticos (ubicación) con datos dinámicos (`localStorage`).

## 5. Implementation Rules & Best Practices
1. **Componentización:** Toda pieza de UI que se repita (ej. `CitaCard`, `DetalleCitaModal`) debe vivir en `src/components/ui/` para mantener las vistas (`pages`) limpias.
2. **Llamadas a la API:** Todas las peticiones deben pasar por la instancia configurada de Axios (`api.js`) para facilitar la futura inyección del token JWT en los headers.
3. **Manejo de Errores UX:** Toda petición asíncrona (`async/await`) debe estar envuelta en un `try-catch`, y se debe usar un estado de `cargando` (loaders) y `error` (mensajes visuales) para no dejar al usuario a ciegas.
4. **Diseño Responsivo:** Uso estricto de los prefijos de Tailwind (`md:`, `lg:`) garantizando que el portal sea usable en dispositivos móviles desde el día 1.