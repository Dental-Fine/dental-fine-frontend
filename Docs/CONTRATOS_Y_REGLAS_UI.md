# Frontend API Contracts & UI Business Rules

Este documento define las rutas consumidas por el Frontend (React) a través de la instancia de Axios, los formatos de datos esperados y las reglas de negocio aplicadas directamente en la Interfaz de Usuario.

## 1. Endpoints Consumidos (Portal Paciente)

### A. Autenticación (Login)
> [!NOTE]
> **Estado MVP:** Actualmente simulado en UI. El formulario intercepta el submit y guarda un objeto en `localStorage`. Pendiente conexión con `POST /api/auth/login`.

### B. Listar Citas del Paciente
**GET** `/citas/paciente/{id}`
- **Uso:** Rellenar el historial y próximas citas en `MisCitas.jsx`.
- **Respuesta Esperada:** Arreglo de objetos. El frontend extrae: `id`, `fecha`, `dentista.nombre`, `tipoServicio.nombre`, `clinica.nombre`, `clinica.ubicacion`, `estado`, `monto`.

### C. Consultar Disponibilidad de Horarios
**GET** `/citas/disponibilidad?dentistaId={id}&fecha={YYYY-MM-DD}`
- **Uso:** Paso 2 del Wizard de `AgendarCita.jsx`.
- **Comportamiento UI:** Mientras el request está en curso, se muestra un *Loader*. Solo se renderizan los botones de las horas donde `disponible === true`.

### D. Agendar Nueva Cita
**POST** `/citas/agendar`
- **Uso:** Paso final de `AgendarCita.jsx`.
- **Payload Enviado:**
  ```json
  {
    "pacienteId": 1, 
    "dentistaId": 2,
    "tipoServicioId": 3,
    "clinicaId": 1,
    "fechaHora": "2026-04-25T10:00:00"
  }

- **Comportamiento UI:** En caso de éxito (201 Created), redirige al paso de "Éxito". Si hay error (400/500), el `catch` intercepta el `error.response.data.message` y lo muestra en una alerta roja.

### E. Cancelar Cita
**PUT** `/citas/{id}/estado?estado=CANCELADA`
- **Uso:** Botón "Cancelar" dentro del `DetalleCitaModal.jsx`.
- **Comportamiento UI:** Tras confirmación nativa (`window.confirm`) y éxito del request, dispara una recarga de la lista de citas (`cargarCitas()`).

---

## 2. UI Business Rules (Reglas de Negocio en Frontend)

Para evitar peticiones innecesarias al servidor, la Interfaz de Usuario aplica las siguientes validaciones en caliente:

### A. Reglas de Formularios
- **Agendar Cita:** No se permite avanzar al Paso 2 si no se ha seleccionado *Tratamiento* y *Especialista*. El botón se deshabilita (`disabled={true}`).
- **Bloqueo de Fechas Pasadas:** Los inputs nativos de fecha (`<input type="date" />`) tienen un atributo `min={today}` para impedir seleccionar días anteriores a la fecha actual.

### B. Reglas de Cancelación de Citas
El botón de "Cancelar Cita" solo se renderiza en el DOM si se cumplen estrictamente estas 3 condiciones matemáticas:
1. `estado !== 'ATENDIDA'` (No se puede cancelar algo que ya ocurrió).
2. `estado !== 'CANCELADA'` (No se puede cancelar algo ya cancelado).
3. `fechaCita > fechaActual` (La fecha original extraída de la base de datos debe ser estrictamente en el futuro comparada con el reloj del navegador del usuario).

### C. Filtrado de Vistas
- **Próximas Citas:** Solo muestra tarjetas donde el estado del backend sea exactamente `PENDIENTE`.
- **Historial:** Agrupa citas con estado `ATENDIDA`, `COMPLETADA` o `CANCELADA`.