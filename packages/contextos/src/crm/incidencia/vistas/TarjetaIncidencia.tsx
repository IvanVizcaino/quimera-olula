import { descripcionEstadoIncidencia } from "#/crm/comun/componentes/EstadoIncidencia.tsx";
import { QAvatar, QEtiqueta, QTarjetaGenerica } from "@olula/componentes/index.js";
import { formatearFechaDate } from "@olula/lib/dominio.ts";
import { Incidencia } from "../diseño.ts";
import "./TarjetaIncidencia.css";

const varianteEstado: Record<
  string,
  "primario" | "advertencia" | "error" | "exito"
> = {
  nueva: "primario",
  en_espera: "advertencia",
  asignada: "primario",
  rechazada: "error",
  cerrada: "exito",
};

export const TarjetaIncidencia = (incidencia: Incidencia) => (
  <article className="TarjetaIncidencia">
    <QTarjetaGenerica
      avatar={
        <QAvatar nombre={incidencia.descripcion} className={incidencia.prioridad} />
      }
      arribaIzquierda={incidencia.descripcion}
      arribaDerecha={
        <QEtiqueta variante={varianteEstado[incidencia.estado] ?? "primario"}>
          {descripcionEstadoIncidencia(incidencia.estado)}
        </QEtiqueta>
      }
      abajoIzquierda={
        <span className="tarjeta-incidencia-cliente">
          {incidencia.nombre || "-"}
        </span>
      }
      abajoDerecha={
        <span className="tarjeta-incidencia-fecha">
          {incidencia.fecha ? formatearFechaDate(incidencia.fecha) : "-"}
        </span>
      }
    />
  </article>
);
