import React from 'react';

// Colores según tu tabla EstadoDientes
const COLORES_ESTADO = {
  Sano: '#ffffff',      // Blanco
  Caries: '#ef4444',    // Rojo
  Restaurado: '#3b82f6', // Azul
  Ausente: '#cbd5e1',   // Gris
  Endodoncia: '#8b5cf6' // Morado
};

export const Diente = ({ numero, estado, onClick }) => {
  return (
    <div 
      onClick={() => onClick(numero)}
      className="flex flex-col items-center group cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-all"
    >
      <span className="text-[10px] font-black text-slate-400 mb-1 group-hover:text-primary">
        {numero}
      </span>
      
      {/* Dibujo del Diente en SVG */}
      <svg width="40" height="40" viewBox="0 0 100 100" className="drop-shadow-sm">
        {/* Cara Superior (Vestibular) */}
       <path d="M20 20 L80 20 L70 35 L30 35 Z" fill={COLORES_ESTADO[estado] || '#fff'} stroke="#cbd5e1" strokeWidth="2" />
        {/* Cara Inferior (Lingual) */}
        <path d="M20 80 L80 80 L70 65 L30 65 Z" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
        {/* Cara Izquierda (Mesial) */}
        <path d="M20 20 L20 80 L35 70 L35 30 Z" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
        {/* Cara Derecha (Distal) */}
        <path d="M80 20 L80 80 L65 70 L65 30 Z" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
        {/* Centro (Oclusal) */}
        <rect x="35" y="35" width="30" height="30" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
      </svg>
    </div>
  );
};