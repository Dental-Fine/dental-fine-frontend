# AGENTS & TECH STACK SPECIFICATION

## Integrantes y Roles
- **Ricardo Moreno Salgado (`richyms123`)**: Patrocinador (Sponsor), QA Lead & UI/UX Designer. Product Owner de EP-02 (Portal de Autogestión) y EP-04 (Expedientes y Financiero). Responsable de DFI-6 (HU-02 Agendamiento Online), DFI-20 (Servicio de correos) y DFI-12 (HU-07 Odontograma interactivo).
- **Kevin Haziel Elias Zavala (`HazielZav`)**: Gerente de Proyecto (Project Manager) & Backend Developer. Product Owner de EP-01 (Seguridad) y EP-03 (Agenda Central). Responsable de arquitectura de persistencia, DFI-5 (HU-01 Control de Acceso), DFI-7 (HU-03 Agenda en tiempo real) y DFI-14 (HU-10 Pagos y Corte).
- **Joseph Andre García Martínez (`AndreJokeis`)**: Backend Developer. Responsable de DFI-19 (HU02-T02 Reglas de concurrencia y validaciones de agenda), DFI-9 (HU-08 Reagendamiento y cancelación online) y DFI-11 (HU-05 Borrado lógico NOM-004).
- **Jesús Guzmán Villalobos (`JesusGV28`)**: Frontend Developer. Responsable de DFI-18 (HU02-T01 Wizard de agendamiento en React), DFI-21/22 (HU-08 Vista Mis Citas), DFI-23 (HU-03 Calendario interactivo), DFI-26 (HU-04 Modal edición de citas), DFI-30 (HU-06 Formulario de expedientes) y DFI-32 (HU-07 Odontograma Canvas/SVG).
- **Luis Enrique Fonseca Sosa (`luisfonseca`)**: Frontend & Integration Developer. Responsable de DFI-29 (HU05-T02 Vista de Recepción unificada y confirmaciones), DFI-8/DFI-13 (HU-06 y HU-09 Plantillas de correo y expedientes médicos).
- **Carlos Alexis Abrego Nuñez**: Analista QA & Testing. Diseño y ejecución de matrices de pruebas de caja negra, clases de equivalencia y valores límite (Login, Agendamiento, Recepción).
- **Dra. Anel Gómez Meraz**: Cliente & Stakeholder Odontológica Principal. Validación operativa y clínica de flujos de trabajo en consultorio.
- **Asistente IA (Antigravity / Copilot / Cursor)**: Asesor Técnico, Arquitecto de Software y Revisor de Código. Co-piloto para resolución de conflictos, refactorizaciones, cumplimiento normativo y verificación de calidad.

---

## Stack Tecnológico Inmutable
- **Backend Core**: Java 17 LTS + Spring Boot 3.x (Spring Web, Spring Data JPA, Spring Security, Spring WebSocket STOMP, Spring Boot Starter Mail).
- **Frontend Core**: React 19 + Vite (SWC) + Tailwind CSS v4 + React Router DOM v7 + Axios + Lucide React.
- **Base de Datos**: PostgreSQL 15+ con integridad transaccional ACID y soporte nativo `JSONB` para el estado gráfico del Odontograma.
- **Migraciones de Base de Datos**: Flyway estrictamente versionado (`src/main/resources/db/migration/V1..V8`). Prohibido terminantemente el uso de `ddl-auto=update`.
- **Seguridad**: Autenticación Stateless basada en tokens JWT (`java-jwt` / `io.jsonwebtoken`) con filtro `SecurityFilter`, interceptores en Axios y componente guardián `RutaProtegida` en React Router.
- **Control de Acceso (RBAC)**: Basado en roles del enumerador: `ROLE_ADMIN`, `ROLE_PACIENTE`, `ROLE_DENTISTA`, `ROLE_PERSONAL_CLINICA`.
- **Tiempo Real**: Spring WebSockets con protocolo STOMP (`/ws-dentalfine` y broker `/topic/agenda`) para actualización reactiva de citas.
- **Pruebas y Calidad**: 
  - Frontend: Vitest + React Testing Library (Pruebas de caja negra: partición de equivalencia y análisis de valores límite).
  - Backend: JUnit 5 + Mockito + Testcontainers / H2.

---

## Reglas de Oro del Código
1. **Cero Borrado Físico (Cumplimiento NOM-004-SSA3-2012)**: Los registros clínicos, pacientes, citas y servicios nunca se eliminan físicamente de la base de datos. Se utiliza borrado lógico mediante la bandera `activo = false` o estados `CANCELADA` / `NO_ASISTIO` y traslado a historial para garantizar la trazabilidad médica legal obligatoria de 5 años.
2. **Flyway como Única Fuente de Verdad del Esquema**: Ninguna tabla o columna se crea o modifica mediante Hibernate. Todo cambio en el esquema debe plasmarse en un script SQL secuencial e inmutable (`V<N>__descripcion.sql`).
3. **Data Transfer Objects (DTOs) Estrictos**: Las entidades JPA jamás se exponen directamente en los controladores ni se reciben en peticiones HTTP. Se deben utilizar DTOs desacoplados (Requests y Responses) con validaciones (`@Valid`, `@NotNull`, `@NotBlank`).
4. **Cero Lógica de Negocio Bloqueante en Notificaciones**: El envío de correos o notificaciones externas debe ejecutarse siempre de forma asíncrona (`@Async`) en un hilo independiente, garantizando que el usuario reciba la respuesta HTTP en milisegundos y con respaldo tolerante a fallos si el servidor SMTP no está disponible (`[ASYNC MOCK]`).
5. **Aislamiento de Rutas y Sesión**: Las rutas del portal de pacientes (`/paciente/*`) y administración (`/admin/*`) deben estar protegidas por `RutaProtegida`. Si el token falta o expira, se expulsa inmediatamente a `/login` con `replace: true`, a excepción de los errores 401 originados en el propio formulario de login.
6. **TRAZABILIDAD OBLIGATORIA CON JIRA (Regla de Control Dual Jira & Memory)**:
   * **Cero cambios huérfanos**: Absolutamente toda nueva funcionalidad, ajuste, refactorización o corrección de bug **DEBE registrarse previamente en Jira** con su identificador único (`DFI-XX`) asignado a su Épica correspondiente (`DFI-1`, `DFI-2`, `DFI-3`, `DFI-4`).
   * Toda rama de Git debe nombrarse con el ticket (`feat/DFI-XX-...`, `fix/DFI-XX-...`, `chore/DFI-XX-...`).
   * Todo commit debe referenciar el ticket: `tipo(alcance): descripcion (DFI-XX)`.
7. **INMUTABILIDAD DE LA BITÁCORA (`memory.md`)**: El archivo `memory.md` es un registro histórico del proyecto. Queda ESTRICTAMENTE PROHIBIDO sobreescribir o eliminar Sprints, tareas pasadas o decisiones arquitectónicas (ADRs). Todo avance nuevo debe AGREGARSE al final o actualizar las casillas de verificación (`[ ]` a `[x]`), preservando la memoria histórica de la clínica.
8. **PROTOCOLO OBLIGATORIO DE INICIO PARA AGENTES IA (Lectura y Registro Vivo)**:
   * **Al iniciar cualquier sesión de chat**, el desarrollador debe instruir al Asistente IA a leer los tres archivos: `agents.md`, `memory.md` y `skills.md`.
   * **El agente debe confirmar explícitamente** que ha comprendido el stack inmutable, el marco normativo (NOM-004), el estado de los tickets de Jira y las reglas del equipo antes de sugerir o escribir código.
   * **Obligación de cierre de sesión**: Todo agente de IA tiene la obligación de registrar en `memory.md` (bajo una entrada fechada en la Bitácora de Decisiones Técnicas o marcando los checkboxes `[x]`) cualquier cambio estructural, corrección de bug o decisión técnica implementada durante la conversación.
