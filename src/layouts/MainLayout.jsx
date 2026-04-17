import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      
      {/*Menú lateral izquierdo fijo */}
      <aside className="w-64 bg-blue-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">Dental Fine</h2>
        <nav className="space-y-4">
          <div className="block p-3 rounded bg-blue-800 font-medium">Inicio</div>
          <div className="block p-3 rounded hover:bg-blue-800 text-blue-200 cursor-pointer">Citas</div>
          <div className="block p-3 rounded hover:bg-blue-800 text-blue-200 cursor-pointer">Pacientes</div>
        </nav>
      </aside>

      {/*Área principal donde colocamos el contenido */}
      <main className="flex-1 overflow-y-auto">
        <Outlet /> {/*Aqui es donde colocamos la pantalla de Inicio*/}
      </main>

    </div>
  );
}