import { Navigate, Outlet } from "react-router-dom";

export const RutaProtegida = ({ children }) => {
    // 1. Obtenemos el Token del LocalStorage
    const token = localStorage.getItem("token_dental_fine");

    // 2. Verificación Simple: Si NO hay token, redirige a Login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 3. Si hay token, mostramos lo que haya dentro de esta ruta
    return children ? children : <Outlet />;
}