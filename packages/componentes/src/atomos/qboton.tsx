import { MouseEventHandler, PropsWithChildren } from "react";
import "./qboton.css";

type QBotonProps = {
  tipo?: "button" | "submit" | "reset";
  variante?: "solido" | "borde" | "texto";
  tamaño?: "pequeño" | "mediano" | "grande";
  destructivo?: boolean;
  deshabilitado?: boolean;
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
  deshabilitado,
  props,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: PropsWithChildren<QBotonProps>) => {
  const attrs = { tamaño, variante, destructivo, deshabilitado };

  return (
    <quimera-boton {...attrs}>
      <button type={tipo} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} {...props} >
        {children}
      </button>
    </quimera-boton>
  );
};
