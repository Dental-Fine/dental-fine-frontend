import { Link } from "react-router-dom";
export const Login = ()=>{
    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <h1 className="text-3xl font-bold text-blue-600 mb-6">
                    Iniciar Sesión
                </h1>
                <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                    Entrar al Sistema
                </Link>

            </div>
            

        </div>
    );
};