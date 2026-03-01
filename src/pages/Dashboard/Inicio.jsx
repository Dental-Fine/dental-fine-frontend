import {Link} from 'react-router-dom'
export const Inicio = ()=>{
    return(
        <div className="min-h-screen bg-gray-50 p-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Bienvenido a Dental Fine</h1>
            <p className="text-gray-600 mb-6">Tu sistema de gestión dental eficiente y fácil de usar.</p>
            <Link to="/" className="text-blue-600 hover:underline font-medium">
                Volver a Inicio
            </Link>
        </div>
    );

};