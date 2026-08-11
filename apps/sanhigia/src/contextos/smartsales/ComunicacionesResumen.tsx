import { getTotalComunicacionesNoLeidas } from "#/comun/comunicacion/infraestructura.ts";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import "./ComunicacionesResumen.css";

export const ComunicacionesResumen = () => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const cargar = async () => {
      const totalNoLeidas = await getTotalComunicacionesNoLeidas();
      setTotal(totalNoLeidas);
    };

    void cargar();
  }, []);

  return (
    <div className="ComunicacionesResumen">
      <span>
        Tienes <strong>{total}</strong> notificaciones sin leer.
      </span>
      <Link to="/comun/comunicacion" className="ComunicacionesResumen__enlace">
        Ir al maestro de comunicaciones
      </Link>
    </div>
  );
};
