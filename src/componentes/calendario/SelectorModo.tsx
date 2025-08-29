import React from 'react';
import { QBoton } from '../atomos/qboton.tsx';
import { ModoCalendario } from './tipos';

interface SelectorModoProps {
  modoActual: ModoCalendario;
  onCambioModo: (modo: ModoCalendario) => void;
  variante?: 'horizontal' | 'vertical';
  mostrarIconos?: boolean;
  modos?: ModoCalendario[]; // Modos permitidos
}

const MODOS: Array<{modo: ModoCalendario, label: string, icono: string}> = [
  { modo: 'semana', label: 'Semana', icono: '📊' },
  { modo: 'mes', label: 'Mes', icono: '📆' },
  { modo: 'anio', label: 'Año', icono: '🗓️' }
];

export const SelectorModo: React.FC<SelectorModoProps> = ({
  modoActual,
  onCambioModo,
  variante = 'horizontal',
  mostrarIconos = false,
  modos = ['semana', 'mes', 'anio'] // Todos los modos por defecto
}) => {
  const className = variante === 'horizontal' 
    ? 'selector-modo-horizontal' 
    : 'selector-modo-vertical';

  // Filtrar solo los modos permitidos
  const modosPermitidos = MODOS.filter(({modo}) => modos.includes(modo));

  return (
    <div className={className}>
      {modosPermitidos.map(({modo, label, icono}) => (
        <QBoton
          key={modo}
          onClick={() => onCambioModo(modo)}
          variante={modoActual === modo ? 'solido' : 'texto'}
        >
          {mostrarIconos && `${icono} `}{label}
        </QBoton>
      ))}
    </div>
  );
};
