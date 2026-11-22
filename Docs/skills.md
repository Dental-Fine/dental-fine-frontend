# TEAM SKILLS & CODING CONVENTIONS

## 0. Ciclo de Vida de Tareas y Control Dual (Jira & Memory)
Para garantizar trazabilidad absoluta y evitar inconsistencias o trabajo duplicado en el equipo, rige la siguiente política:
1. **Paso 1 - Registro en Jira**: Ningún desarrollador escribe código sin que exista previamente un ticket creado y asignado en Jira (`DFI-XX`), clasificado como Historia, Subtarea o Bug dentro de su Épica correspondiente (`DFI-1` a `DFI-4`).
2. **Paso 2 - Creación de Rama**: Se crea la rama de trabajo a partir de `develop` con el nombre del ticket: `feat/DFI-XX-...` o `fix/DFI-XX-...`.
3. **Paso 3 - Commits con Trazabilidad**: Todo commit debe mencionar obligatoriamente el ticket: `tipo(alcance): descripcion (DFI-XX)`.
4. **Paso 4 - Validación y Pruebas**: Ejecutar localmente las pruebas unitarias (`mvn test` o `npm test`) antes de solicitar integración.
5. **Paso 5 - Sincronización en Jira y Bitácora**: Al concluir o fusionar, se mueve el ticket en Jira a **Listo** (`Done`) y se actualiza la casilla en `memory.md` (`[ ]` a `[x]`). Si hubo un cambio de diseño o alcance, se redacta la entrada fechada en la Bitácora de Decisiones Técnicas (ADR).

---

### Plantilla Obligatoria de Inicio para Chats con IA (Prompt de Arranque)
Cada vez que un integrante del equipo abra un nuevo chat con un Agente de IA (Antigravity, Copilot, Cursor, ChatGPT, etc.), debe enviar el siguiente mensaje inicial como primer prompt:

```text
Hola. Estoy trabajando en el proyecto Dental Fine (PRJ-DF-2025-001).
Antes de comenzar cualquier análisis o cambio en el código, por favor LEE atentamente los siguientes tres archivos de documentación en la carpeta docs/:
1. docs/agents.md (Roles, stack inmutable y las 8 Reglas de Oro)
2. docs/memory.md (Marco regulatorio NOM-004/NOM-013, bitácora ADR y estado de tickets de Jira DFI-XX)
3. docs/skills.md (Convenciones de ramas, commits, patrones de arquitectura y runbook)

Por favor confirma que los has leído, resume brevemente tu comprensión de las Reglas de Oro (especialmente NOM-004 de no borrado físico, inmutabilidad de Flyway y la regla de no romper la sesión con errores 401 en login) y confirma que asentarás en memory.md cualquier decisión o cambio que realicemos en esta sesión.

Mi ticket de Jira para esta sesión es: [DFI-XX: Descripción de la tarea]
Mi rol en el equipo es: [Tu Nombre / Rol]
```

---

## 1. Convención de Nombres de Ramas (Git)
Las ramas se crean a partir de `develop` con prefijos estandarizados en minúsculas y referencia al identificador del ticket de Jira:
- **Nuevas Funcionalidades**: `feat/DFI-XX-descripcion-corta` (ej. `feat/DFI-20-notificaciones-correo`, `feat/DFI-19-modal-edicion-cita`, `feat/DFI-32-odontograma-svg`).
- **Corrección de Defectos / Bugs**: `fix/DFI-XX-descripcion-del-bug` (ej. `fix/DFI-38-bucle-401-login`, `fix/DFI-40-configuracion-expedientes`).
- **Tareas de Infraestructura o Mantenimiento**: `chore/DFI-XX-descripcion` (ej. `chore/DFI-39-configuracion-smtp-gmail`, `chore/setup-vitest`).
- **Ramas Principales**:
  * `main`: Código estable en producción o entregables evaluados.
  * `develop`: Rama base de desarrollo e integración continua. Todo cambio debe integrarse mediante Pull Request (PR) con revisión previa.

---

## 2. Convención de Commits (Conventional Commits + Jira)
Los mensajes de confirmación deben ser descriptivos, redactados en español simple con verbos en infinitivo y haciendo mención obligatoria al ticket de Jira:
`tipo(alcance): descripción breve y concisa (DFI-XX)`

- `feat(agenda)`: `feat(agenda): agregar modal de edicion y reagendamiento de citas (DFI-10)`
- `feat(email)`: `feat(email): integrar servicio asincrono de envio de notificaciones (DFI-20)`
- `fix(auth)`: `fix(auth): corregir bucle infinito en interceptor de axios ante 401 (DFI-38)`
- `chore(email)`: `chore(email): configurar fallback [ASYNC MOCK] para servidor smtp sin credenciales (DFI-39)`
- `test(citas)`: `test(citas): agregar pruebas de caja negra para cancelacion y validacion de campos (DFI-29)`
- `docs(team)`: `docs(team): sincronizar cronograma de jira y bitacora de decisiones tecnicas (DFI-01)`

---

## 3. Patrón de Consumo de API y Manejo de Estado (Frontend React)
Toda interacción con el backend se centraliza en la capa de servicios (`src/services/api.js` o módulos dedicados en `src/services/`):

- **Cliente Axios Centralizado**:
  ```javascript
  import axios from 'axios';

  export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: { 'Content-Type': 'application/json' }
  });

  // Interceptor de Petición: Inyección automática de Token JWT
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('token_dental_fine') || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  ```

- **Interceptor de Respuesta y Manejo de Errores de Sesión (DFI-38)**:
  ```javascript
  api.interceptors.response.use(
    response => response,
    error => {
      // Regla de Oro: Si falla el endpoint de login mismo, no expulsar en bucle
      const isLoginRequest = error.config?.url?.includes('/auth/login');

      if (error.response && (error.response.status === 401 || error.response.status === 403) && !isLoginRequest) {
        localStorage.removeItem('token_dental_fine');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('usuario_dental_fine');
        window.location.replace('/login');
      }
      return Promise.reject(error);
    }
  );
  ```

- **Patrón de Estado en Componentes UI**:
  Cada pantalla o formulario interactivo debe manejar estados explícitos de carga, error y datos:
  ```javascript
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [citas, setCitas] = useState([]);
  ```

---

## 4. Patrón de Servicios y Asincronía (Backend Spring Boot)
- **Controladores Delgados (`@RestController`)**: Se limitan a recibir la petición HTTP, validar los DTOs con `@Valid` y retornar `ResponseEntity<T>`. Cero lógica de negocio o consultas directas a repositorios.
- **Servicios Robustos (`@Service`)**: Contienen el 100% de las validaciones de negocio y transaccionalidad.
- **Transaccionalidad Explícita**:
  * Métodos de sólo lectura: `@Transactional(readOnly = true)` para optimizar el rendimiento y evitar `LazyInitializationException`.
  * Métodos de escritura o modificación: `@Transactional` garantizando atomicidad ACID.
- **Asincronía Tolerante a Fallos en Notificaciones (DFI-20 / DFI-39)**:
  Todo envío de correos o llamadas a servicios lentos debe desacoplarse del hilo principal de ejecución HTTP mediante `@Async`:
  ```java
  @Service
  public class EmailService {
      private static final Logger log = LoggerFactory.getLogger(EmailService.class);

      @Async
      public void enviarCorreoConfirmacion(String destinatario, CitaResponseDto cita) {
          try {
              // Intento de envío real vía JavaMailSender (Gmail / Mailtrap)
              mailSender.send(mensaje);
              log.info("[ASYNC EMAIL] Correo enviado exitosamente a: {}", destinatario);
          } catch (Exception ex) {
              // Fallback seguro: no bloquea ni rompe el agendamiento del paciente
              log.warn("[ASYNC MOCK] Notificación simulada (sin SMTP configurado o falla de red): {}", destinatario);
          }
      }
  }
  ```

---

## 5. Patrón de Persistencia y Migraciones de Base de Datos
- **Flyway como Regulador Inmutable de Esquema**:
  * Ubicación obligatoria: `src/main/resources/db/migration/V<N>__<descripcion>.sql`.
  * Los números de versión son estrictamente secuenciales (`V1`, `V2`, `V3`, etc.).
  * **Regla Inmutable**: Una vez que un archivo de migración se subió al repositorio o se ejecutó en alguna base de datos, queda terminantemente prohibido editarlo. Cualquier cambio o corrección se realiza en un nuevo archivo `V<N+1>`.
- **Regla de Borrado Lógico (NOM-004-SSA3-2012 / DFI-11)**:
  Toda entidad clínica (Pacientes, Citas, Odontogramas, Servicios) debe incorporar el atributo `activo`:
  ```java
  @Column(name = "activo", nullable = false)
  private Boolean activo = true;
  ```
  Los métodos de consulta en los repositorios JPA deben filtrar siempre por `findByActivoTrue()` o incorporar `@Where(clause = "activo = true")`.
- **Mapeo de Datos Complejos (Odontograma en PostgreSQL `JSONB` / DFI-12)**:
  ```java
  @Column(name = "estado_dientes", columnDefinition = "jsonb")
  private String estadoDientes;
  ```

---

## 6. Componentes de UI Mandatorios (Tailwind CSS v4 + Lucide)
- **Campos de Formulario**:
  `rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 p-2.5 text-sm` con mensaje de validación inferior en `text-red-500 text-xs mt-1`.
- **Botón Primario de Acción**:
  `bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50`
- **Botón Secundario o Cancelación**:
  `bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-lg border border-slate-300 transition-all`
- **Insignias de Estado de Citas (Píldoras semánticas)**:
  * **Confirmada**: `bg-green-100 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-semibold`
  * **Pendiente**: `bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold`
  * **Cancelada**: `bg-red-100 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold`
  * **Completada**: `bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold`
- **Iconografía**:
  Uso exclusivo de la biblioteca `lucide-react` para mantener coherencia geométrica y de trazo en toda la aplicación.

---

## 7. Runbook de Ejecución y Pruebas Locales

### Backend (Spring Boot 3 + PostgreSQL)
- **Requisitos**: JDK 17 LTS instalado y base de datos PostgreSQL activa (`dentalfine_db` en puerto 5432).
- **Configuración de Variables de Entorno en Windows PowerShell**:
  ```powershell
  $env:JAVA_HOME = "C:\Program Files\Java\jdk-17.0.1"
  $env:SPRING_PROFILES_ACTIVE = "dev"
  ```
- **Compilación y Pruebas Unitarias**:
  ```powershell
  cd dental-fine-backend
  .\mvnw.cmd clean test
  ```
- **Ejecución Local del Servidor**:
  ```powershell
  .\mvnw.cmd spring-boot:run
  # API escuchando en: http://localhost:8080/api
  ```

### Frontend (React 19 + Vite)
- **Requisitos**: Node.js v18+ y npm.
- **Instalación de Dependencias**:
  ```powershell
  cd dental-fine-frontend
  npm install
  ```
- **Ejecución de Suite de Pruebas (Vitest)**:
  ```powershell
  npm test
  # Debe arrojar 8/8 tests aprobados
  ```
- **Servidor de Desarrollo**:
  ```powershell
  npm run dev
  # Aplicación disponible en: http://localhost:5173
  ```
- **Compilación para Producción**:
  ```powershell
  npm run build
  ```
