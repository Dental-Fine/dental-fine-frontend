import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080', 
  headers: {
    'Content-Type': 'application/json'
  }
});

// 1. Interceptor de Peticiones (Request)
// Se ejecuta ANTES de que la petición salga hacia el Backend.
// Su trabajo es buscar el Token y "pegárselo" a la petición.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token_dental_fine');
    if (token) {
      // El estándar de seguridad es mandarlo como "Bearer [token]"
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Interceptor de Respuestas (Response)
// Se ejecuta cuando el Backend nos contesta, ANTES de llegar a tus componentes.
// Su trabajo es atrapar los errores de sesión a nivel global.
api.interceptors.response.use(
  (response) => {
    // Si la respuesta fue exitosa (200 OK, 201 Created), la deja pasar normal
    return response;
  },
  (error) => {
    // Si el backend dice "401 Unauthorized" (El token expiró o es falso)
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada o token inválido. Expulsando usuario...");
      
      // 1. Destruimos la sesión local
      localStorage.removeItem('token_dental_fine');
      localStorage.removeItem('usuario_dental_fine');
      
      // 2. Lo mandamos a la calle (Login). 
      // NOTA: Como esto es un archivo puro de JS (no es componente de React), 
      // no podemos usar 'useNavigate', así que usamos JS puro:
      window.location.href = '/';
    }
    
    // Si es otro error (como 404 Not Found o 500 Server Error), se lo pasamos al componente
    return Promise.reject(error);
  }
);