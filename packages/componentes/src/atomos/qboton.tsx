import { MouseEventHandler, PropsWithChildren } from "react";
import "./qboton.css";

type QBotonProps = {
  tipo?: "button" | "submit" | "reset";
  variante?: "solido" | "borde" | "texto";
  tamaño?: "pequeño" | "mediano" | "grande" | "xl";
  destructivo?: boolean;
  advertencia?: boolean;
  exito?: boolean;
  ancho?: boolean;
  deshabilitado?: boolean;
  texto?: string;
  onClick?: MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLButtonElement>;
  props?: React.ButtonHTMLAttributes<HTMLButtonElement>;
};

export const QBoton = ({
  children,
  tipo = "button",
  variante = "solido",
  tamaño = "mediano",
  destructivo,
  advertencia,
  exito,
  ancho,
  deshabilitado,
  texto,
  props,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: PropsWithChildren<QBotonProps>) => {
  const attrs = { tamaño, variante, destructivo, advertencia, exito, ancho, deshabilitado };

  return (
    <quimera-boton {...attrs}>
      <button
        type={tipo}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...props}
      >
        {texto || children}
      </button>
    </quimera-boton>
  );
};
