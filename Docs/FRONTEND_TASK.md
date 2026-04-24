# Frontend Roadmap - Tareas Pendientes (MVP -> V1)

Después de consolidar el MVP de Dental Fine (Flujos base de Paciente, UI/UX, Manejo de Estado Local), este es el hilo de las siguientes prioridades a abordar para escalar la aplicación a producción, sincronizadas con los avances del Backend.

## 1. Seguridad y Autenticación (JWT)
- [ ] **Eliminar Mocks:** Retirar el guardado manual en `localStorage` del `Login.jsx`.
- [ ] **Axios Interceptors:** Configurar un interceptor en `src/services/api.js` para inyectar automáticamente el header `Authorization: Bearer {token}` en todas las peticiones privadas.
- [ ] **Rutas Protegidas:** Crear un componente `<ProtectedRoute>` en React Router para redirigir al `/login` si el usuario no tiene un token válido o si ha expirado.
- [ ] **Manejo de Roles:** Leer el payload del JWT para renderizar dinámicamente el menú lateral (ej. ocultar opciones administrativas si el rol es `ROLE_PACIENTE`).

## 2. Catálogos Dinámicos
- [ ] **Dentistas y Servicios:** Reemplazar los arrays estáticos (`serviciosMock`, `dentistasMock`) en `AgendarCita.jsx` por llamadas a `GET /api/servicios` y `GET /api/dentistas`.

## 3. Módulo de Odontograma Interactivo
- [ ] **UI del Odontograma:** Diseñar un componente visual (basado en SVG o CSS Grid) que represente los 32 dientes del adulto (y dentición temporal si aplica).
- [ ] **Interactividad:** Permitir al usuario/doctor hacer clic en cuadrantes específicos del diente para cambiar estados (Sano, Caries, Resina, Extracción) usando un menú contextual.
- [ ] **Parser a JSON:** Construir la lógica para convertir el estado visual del Odontograma a una estructura JSON que el backend espera recibir.

## 4. Gestión de Expediente Clínico y Archivos
- [ ] **Formularios de Antecedentes:** Crear las vistas para el Historial Médico, dividiendo los formularios por secciones (Alergias, Padecimientos, etc.).
- [ ] **Subida de Archivos (Drag & Drop):** Integrar un componente para arrastrar y soltar radiografías o resultados de laboratorio.
- [ ] **Peticiones Multipart:** Configurar Axios para enviar formularios con `Content-Type: multipart/form-data` al backend para su carga en S3/Local.

## 5. Reactividad y WebSockets
- [ ] **Cliente STOMP:** Instalar dependencias (`@stomp/stompjs` y `sockjs-client`) para escuchar eventos del servidor.
- [ ] **Sincronización de Agenda:** Suscribirse al canal de WebSockets del backend para que, si un doctor cancela una cita o la marca como "Atendida", la vista de `MisCitas.jsx` se actualice en tiempo real sin necesidad de recargar la página.

## 6. Estandarización Financiera
- [ ] **Formateo de Moneda:** Crear una función de utilidad (`utils/formatCurrency.js`) usando `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })` para garantizar que todos los precios de servicios y montos de citas se muestren estrictamente a dos decimales y con el símbolo correcto.