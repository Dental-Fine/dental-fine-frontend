export const login = (correo, contrasena) => {
    return new Promise((resolve, reject) => {
      // Simulamos la latencia de red de 800ms
      setTimeout(() => {
        if (correo === "admin@clinica.com" && contrasena === "12345") {
          resolve({
            token: "mock-jwt-token-123",
            usuario: { id: 1, rol: "PERSONAL_CLINICA" }
          });
        } else {
          reject(new Error("Credenciales inválidas"));
        }
      }, 800);
    });
  };