# PROJECT MEMORY & DECISION LOG

## Propósito del Proyecto
Sistema SaaS web integral de gestión clínica y administrativa odontológica con arquitectura distribuida, portal de autoservicio para pacientes y sincronización en tiempo real para consultorios dentales.
(Nombre oficial: Dental Fine - Código: `PRJ-DF-2025-001`).

- **Patrocinador (Sponsor)**: Ricardo Moreno Salgado (`richyms123`)
- **Gerente de Proyecto (PM)**: Kevin Haziel Elias Zavala (`HazielZav`)
- **Cliente & Stakeholder Principal**: Dra. Anel Gómez Meraz (Directora Clínica Dental Fine)

---

## Marco Regulatorio Acordado
- **NOM-004-SSA3-2012 (Del expediente clínico)**:
  * Obligatoriedad de confidencialidad, autenticidad, integridad y disponibilidad del historial clínico odontológico por un periodo mínimo legal de 5 años.
  * **Cero Borrado Físico (0% Hard Delete)**: Ningún registro clínico, paciente o cita puede ser eliminado físicamente de la base de datos. Se exige borrado lógico (`activo = false`) y registro histórico inmutable de auditoría.
- **NOM-013-SSA2-2015 (Para la prevención y control de enfermedades bucales)**:
  * Estandarización de la simbología dental y numeración conforme a la nomenclatura de la FDI (Federación Dental Internacional: cuadrantes 1 al 4 para adultos, 5 al 8 para infantes).
  * Registro de diagnósticos y tratamientos por superficie anatómica (oclusal, mesial, distal, vestibular, lingual/palatina).
- **LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares)**:
  * Tratamiento de datos sensibles de salud: cifrado irreversible de contraseñas (BCrypt), tokens efímeros de sesión (JWT) y autorización basada en roles (RBAC).
- **Métricas de Calidad FURPS+ Acordadas**:
  * **Rendimiento**: Tiempo de respuesta < 2s en consulta de disponibilidad de agenda y < 3s en carga general.
  * **Confiabilidad**: 0% de sobreposición o empalme de citas para un mismo dentista/sillón. Disponibilidad esperada del 99.5%.
  * **Usabilidad**: Curva de aprendizaje < 2 horas para personal de recepción y doctores; diseño responsivo para tablets de consultorio y smartphones.

---

## Bitácora de Decisiones Técnicas

**2026-10-14**: Aprobación del Acta Constitutiva del Proyecto (`PRJ-DF-2025-001`).
* Se conforma el equipo multidisciplinario de 6 ingenieros bajo la dirección de Ricardo Moreno (Sponsor) y Kevin Haziel Elias (PM).
* Se define una arquitectura desacoplada cliente-servidor: Frontend SPA en React y Backend RESTful en Spring Boot con PostgreSQL.

**2026-10-20**: Inicialización del Repositorio y Versionado de Base de Datos.
* Se establece el esquema de ramas `main` (producción) y `develop` (integración). Cada requerimiento se trabajará en ramas `feature/` o `fix/` integradas mediante Pull Request.
* Se adopta **Flyway** como la única fuente de verdad para el esquema de PostgreSQL. Queda estrictamente prohibido `spring.jpa.hibernate.ddl-auto=update` para garantizar reproducibilidad exacta entre entornos. Se crean las migraciones `V1__init_schema.sql` y `V2__seed_catalogos.sql`.

**2026-10-28**: Estandarización del Modelo de Datos y Auditoría.
* Nombres de tablas en minúsculas y plural (`pacientes`, `citas`, `servicios`, `tratamientos`, `pagos`).
* Claves primarias estándar `id` tipo `bigint / serial`.
* Toda tabla de dominio incluye campos obligatorios de ciclo de vida: `activo boolean default true`, `created_at timestamp` y `updated_at timestamp`.

**2026-11-04**: Decisión Arquitectónica del Odontograma Digital (HU-07 / DFI-12).
* Persistencia del estado dental: Para evitar esquemas relacionales rígidos con 32x5=160 registros por consulta, se opta por almacenar la dentición interactiva en una columna nativa `JSONB` (`estado_dientes`) en PostgreSQL.
* El frontend modela las 32 piezas permanentes y 20 temporales bajo el sistema FDI con sus 5 caras interactivas, mapeando estados clínicos (`caries`, `obturacion`, `extraccion`, `corona`, `sano`).

**2026-11-10**: HU-01 (DFI-5 / DFI-38) Arquitectura de Seguridad y Control de Acceso.
* Implementación de autenticación Stateless mediante JWT con el filtro `SecurityFilter` en Spring Boot.
* Roles del sistema estandarizados: `ROLE_ADMIN`, `ROLE_PACIENTE`, `ROLE_DENTISTA`, `ROLE_PERSONAL_CLINICA`.
* En Frontend se implementa el componente guardián `RutaProtegida` en React Router v7 con redirección forzada a `/login` (`replace: true`) si el token expira o no cumple el rol necesario.
* *Regla de excepción (DFI-38)*: El interceptor de Axios no debe ejecutar redirección forzada si el error 401 proviene del endpoint de autenticación `/api/auth/login`, evitando bucles infinitos en pantalla.

**2026-11-10**: Separación de Layouts en Frontend.
* `MainLayout`: Vista completa con barra lateral persistente (Sidebar) y accesos directos para doctores, administradores y recepción.
* `PortalPacienteLayout`: Experiencia ligera, centrada en el paciente, sin barras laterales complejas y 100% responsiva para smartphones.

**2026-11-10**: Corrección de `LazyInitializationException` en `CitaService`.
* Se detectó que las relaciones `@ManyToOne` hacia `Paciente`, `Dentista` y `Servicio` causaban fallas en la serialización de DTOs fuera de la sesión de Hibernate.
* Se resolvió anotando formalmente los métodos de consulta con `@Transactional(readOnly = true)` y asegurando el mapeo explícito de entidades a DTOs dentro del servicio transaccional.

**2026-11-10**: HU-02 (DFI-20 / DFI-39) Notificaciones Asíncronas de Citas por Correo.
* Se implementa `EmailService` con `@Async` y `@EnableAsync` para desacoplar el envío de correos del ciclo de petición HTTP, reduciendo la latencia de agendamiento a < 150ms.
* **Estrategia de Proveedor SMTP**:
  * Configuración primaria para producción/staging mediante servidor SMTP de Gmail (`smtp.gmail.com:587`, TLS y contraseña de aplicación de Google Workspace).
  * Soporte para Mailtrap en perfiles de pruebas mediante variables de entorno en `application.properties`.
  * **Fallback tolerante a fallos (`[ASYNC MOCK]`)**: Si el servidor SMTP no está configurado o falla la red, el sistema captura la excepción, registra la notificación en consola con el tag `[ASYNC MOCK]` y NO cancela la transacción de la cita ni arroja error 500 al usuario.

**2026-11-16**: HU-04 (DFI-10 / DFI-26) Modal de Edición de Citas y TIEMPO REAL con WebSockets (DFI-7 / DFI-24).
* Se crea el componente `ModalEdicionCita.jsx` permitiendo cambio dinámico de estado (Pendiente, Confirmada, Cancelada, Completada), reprogramación de fecha/hora y registro de motivo de cancelación.
* Se integra Spring WebSocket con STOMP (`/ws-dentalfine` y broker `/topic/agenda`) para que cualquier cambio realizado por un recepcionista o paciente actualice la vista de todos los clientes conectados sin necesidad de recargar la página (`F5`).

**2026-11-21**: Resolución de Conflictos y Sincronización de Ramas de Frontend.
* Integración limpia de `develop` con `feature/correo-citas` resolviendo colisiones en `ModalCita.jsx`, `Inicio.jsx`, `DashboardRecepcion.jsx` y `api.js`.
* Suite de pruebas unitarias Vitest validada al 100% (8 de 8 pruebas de caja negra aprobadas) y compilación limpia para producción (`npm run build`).

**2026-11-21**: Delimitación de Alcance de Facturación y Pagos (HU-10 / DFI-14).
* Tras análisis de complejidad y priorización con el Product Manager, se divide el módulo de pagos en dos etapas:
  * **Fase 1 (MVP Operativo Actual)**: Emisión de comprobantes internos de cobro (`Ticket` y `DetalleTicket`), desglose por servicios y tratamientos aplicados, cálculo automático de subtotal, IVA (16%) y total, y registro manual del método de pago recibido en clínica (Efectivo, Terminal bancaria física, Transferencia).
  * **Fase 2 (Siguientes Sprints)**: Integración de pasarelas de pago online en el portal del paciente (Stripe / Mercado Pago) y facturación electrónica CFDI 4.0 ante el SAT.

**2026-11-22**: Sincronización Oficial del Backlog de Jira con `memory.md` y Regla de Control Dual.
* **Política de Cero Cambios Huérfanos**: Se establece como mandatorio que absolutamente toda nueva funcionalidad, ajuste o reporte de bug debe ser registrado primero en Jira con su ticket correspondiente (`DFI-XX`) y posteriormente reflejado en `memory.md`.
* Se homologan las 4 Épicas del Cronograma Oficial de Jira (`DFI-1` a `DFI-4`) con sus Historias de Usuario, Subtareas técnicas y Bugs en la sección de control del proyecto.

**2026-11-22**: Apertura de DFI-40 (HU-06) y Subtareas DFI-41 / DFI-42 para Cumplimiento Normativo del Expediente Clínico.
* Tras asesoría clínico-normativa (NOM-004-SSA3-2012 y NOM-013-SSA2-2015), se inicia el desarrollo de la modificación y configuración del expediente clínico.
* Se desglosa en dos subtareas: DFI-41 (Backend: Migración Flyway V9 y ampliación de entidades JPA/DTOs) y DFI-42 (Frontend: Modal interactivo y badges de alerta médica).

---

## Cronograma de Jira y Estado de Entregables

### EP-01: Autenticación, Seguridad y Gestión de Sesiones (`DFI-1`)
*Responsable de Épica: Kevin Haziel Elias Zavala (`HazielZav`)*
- [x] **DFI-5 (HU-01)**: Autenticación de Usuarios y Control de Acceso (CU0) - *Kevin Haziel*
- [x] **DFI-38 (Bug)**: HU-01 - Inicio y Cierre de Sesión en Portal de Pacientes (Solución bucle 401) - *Ricardo Moreno*

### EP-02: Portal de Autogestión de Pacientes (`DFI-2`)
*Responsable de Épica: Ricardo Moreno Salgado (`richyms123`)*
- [-] **DFI-6 (HU-02)**: Agendamiento de Citas en Línea (CU2) [En curso] - *Ricardo Moreno*
  - [x] **DFI-18 (HU02-T01)**: Construir wizard paso a paso en React para selección de tratamiento, doctor y calendario - *Jesús Guzmán*
  - [x] **DFI-19 (HU02-T02)**: Crear endpoint `/api/citas/agendar-online` con validación de concurrencia y reglas de negocio - *Joseph André*
  - [x] **DFI-20 (HU02-T03)**: Integrar servicio asíncrono de envío de notificaciones por correo electrónico - *Ricardo Moreno*
  - [ ] **DFI-39 (HU02-T04)**: Configurar proveedor de correos electrónicos para el servicio de notificaciones - *Ricardo Moreno*
- [x] **DFI-9 (HU-08)**: Consulta, Cancelación y Reagendamiento Online (CU3, CU4, CU5) - *Joseph André*
  - [x] **DFI-21 (HU08-T01)**: Desarrollar vista "Mis Citas" con filtros por estado (Confirmada, Cancelada, Completada) - *Jesús Guzmán*
  - [x] **DFI-22 (HU08-T02)**: Implementar endpoint `PUT /api/citas/{id}/reagendar` verificando disponibilidad previa - *Jesús Guzmán*

### EP-03: Gestión de Agenda Central y Operación de Clínica (`DFI-3`)
*Responsable de Épica: Kevin Haziel Elias Zavala (`HazielZav`)*
- [x] **DFI-10 (HU-04)**: Modificación y Reagendamiento en Recepción (CU1 Ex) - *Ricardo Moreno*
  - [x] **DFI-26 (HU04-T01)**: Crear modal de edición de cita en React con carga dinámica de catálogos - *Jesús Guzmán*
  - [x] **DFI-27 (HU04-T02)**: Implementar endpoint `PUT /api/citas/{id}` para actualización de parámetros - *Kevin Haziel*
- [x] **DFI-11 (HU-05)**: Cancelación Lógica y Archivado de Citas (Regla 4 y NOM-004) - *Joseph André*
  - [x] **DFI-28 (HU05-T01)**: Implementar borrado lógico (campo estado = 'CANCELADA' / 'NO_ASISTIO') en la base de datos - *Joseph André*
  - [x] **DFI-29 (HU05-T02)**: Diseñar interfaz de confirmación y traslado al historial en la vista de recepción - *Luis Fonseca*
- [x] **DFI-7 (HU-03)**: Agenda Central Interactiva en Tiempo Real (CU1) - *Kevin Haziel*
  - [x] **DFI-23 (HU03-T01)**: Implementar componente de calendario interactivo en React con vistas día/semana/mes - *Jesús Guzmán*
  - [x] **DFI-24 (HU03-T02)**: Configurar WebSocket STOMP sobre el canal `/topic/agenda` para sincronización bidireccional - *Kevin Haziel*
  - [x] **DFI-25 (HU03-T03)**: Implementar manejo explícito de bloqueos y transacciones en Spring Boot/JPA - *Kevin Haziel*

### EP-04: Expedientes Médicos y Control Financiero (`DFI-4`)
*Responsable de Épica: Ricardo Moreno Salgado (`richyms123`)*
- [ ] **DFI-13 (HU-09)**: Servicio de Notificaciones Automáticas - *Luis Fonseca*
  - [ ] **DFI-34 (HU09-T01)**: Configuración de plantilla de correo y cola de envíos asíncronos - *Luis Fonseca*
- [ ] **DFI-8 (HU-06)**: Registro y Consulta de Expedientes Médicos (CU3) - *Luis Fonseca*
  - [x] **DFI-30 (HU06-T01)**: Formularios frontend para datos personales, antecedentes y tipo de sangre - *Jesús Guzmán*
  - [ ] **DFI-31 (HU06-T02)**: Servicios REST para consulta de pacientes por nombre, teléfono o ID - *Kevin Haziel*
- [x] **DFI-40**: HU-06 - Modificación y Configuración de Expedientes Médicos - *Ricardo Moreno*
  - [x] **DFI-41 (DFI-40-T01)**: Migración Flyway V9, modelo JPA y DTOs para expediente clínico NOM-004 y NOM-013 - *Ricardo Moreno*
  - [x] **DFI-42 (DFI-40-T02)**: Modal interactivo de configuración de expediente y visualización de alertas médicas en React - *Ricardo Moreno*
- [-] **DFI-12 (HU-07)**: Mapa Dental e Historial Clínico (Odontograma Interactivo) [En curso] - *Ricardo Moreno*
  - [x] **DFI-32 (HU07-T01)**: Desarrollo del componente de Odontograma interactivo con SVG/Canvas - *Jesús Guzmán*
  - [ ] **DFI-33 (HU07-T02)**: API para almacenamiento de evoluciones dentales asociadas al expediente (`JSONB`) - *Ricardo Moreno*
- [ ] **DFI-14 (HU-10)**: Registro Transaccional de Pagos y Corte de Caja - *Kevin Haziel*
  - [ ] **DFI-35 (HU10-T01)**: Desarrollo de módulo de previsualización de cobro y registro de auditoría de cierre (Fase 1 Ticket/DetalleTicket) - *Sin asignar*
