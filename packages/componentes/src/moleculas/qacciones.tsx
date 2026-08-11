import { useState } from "react";
import { QBoton } from "../atomos/qboton.tsx";
import { QIcono } from "../atomos/qicono.tsx";
import "./qacciones.css";

export type Accion =
  | {
      icono?: string;
      texto?: string;
      onClick: () => void;
      deshabilitado?: boolean;
      variante?: "solido" | "borde" | "texto";
      advertencia?: boolean;
    }
  | false;

export const QuimeraAcciones = ({
  acciones,
  vertical,
}: {
  acciones: (Accion | false)[];
  vertical?: boolean;
}) => {
  const [activo, setActivo] = useState(false);

  const handleAccionesClick = () => {
    setActivo((prev) => !prev);
  };

  const renderItemAccion = (accion: Accion) => {
    if (typeof accion === "object" && accion.icono && !accion.texto) {
      return (
        <span key={accion.icono} onClick={accion.onClick}>
          <QIcono nombre={accion.icono} tamaño="sm" />
        </span>
      );
    } else if (accion && typeof accion === "object") {
      return (
        <QBoton
          key={accion.texto || accion.icono}
          onClick={accion.onClick}
          deshabilitado={accion.deshabilitado}
          advertencia={accion.advertencia}
          variante={accion.deshabilitado ? accion.variante : "solido"}
        >
          {accion.texto}
        </QBoton>
      );
    } else {
      return null;
    }
  };

  const renderItemsAcciones = (
    acciones: (Accion | false)[],
    inline = false
  ) => {
    return (
      <div className={inline ? "acciones acciones-inline" : "acciones"}>
        {acciones.map((accion: Accion) => renderItemAccion(accion))}
      </div>
    );
  };

  const renderAcciones = (accionesGenerales: (Accion | false)[]) => {
    return (
      <div className="actions">
        <div className="header">
          <QBoton key="acciones" onClick={handleAccionesClick} variante="borde">
            Acciones
          </QBoton>
        </div>
        {activo && renderItemsAcciones(accionesGenerales)}
      </div>
    );
  };

  const render = () => {
    const accionesGenerales = acciones.filter((accion): accion is Accion =>
      Boolean(accion)
    );

    return (
      <quimera-acciones
        className={`${vertical === true ? "vertical" : ""} ${activo ? "abierto" : ""}`.trim()}
      >
        {accionesGenerales.length > 0 &&
          vertical === true &&
          renderAcciones(accionesGenerales)}
        {accionesGenerales.length === 1 &&
          vertical !== true &&
          renderItemAccion(accionesGenerales[0])}
        {accionesGenerales.length > 0 &&
          accionesGenerales.length > 1 &&
          vertical !== true &&
          renderItemsAcciones(accionesGenerales, true)}
      </quimera-acciones>
    );
  };

  return render();
};
