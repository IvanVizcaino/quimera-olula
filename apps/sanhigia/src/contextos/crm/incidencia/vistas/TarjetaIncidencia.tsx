import { QAvatar } from "@olula/componentes/index.js";
import { Incidencia } from "../diseño.ts";
import "./TarjetaIncidencia.css";

export const TarjetaIncidencia = ({
  incidencia,
}: {
  incidencia: Incidencia;
}) => (
  <div className="tarjeta-incidencia">
    <div className="columna">
      <div className="tarjeta-icono">
        <QAvatar nombre={incidencia.nombreCliente} tamaño="sm" />
      </div>
    </div>
    <div className="columna">
      <div className="tarjeta-titulo">{incidencia.descripcion}</div>
      <div className="tarjeta-detalle">ID: {incidencia.id}</div>
      <div className="tarjeta-detalle">Cliente: {incidencia.nombreCliente}</div>
    </div>
  </div>
);
