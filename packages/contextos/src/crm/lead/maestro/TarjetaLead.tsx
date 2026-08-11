import { QAvatar, QTarjetaGenerica } from "@olula/componentes/index.js";
import { Lead } from "../diseño.ts";
import "./TarjetaLead.css";

export const TarjetaLead = (lead: Lead) => {
  return (
    <QTarjetaGenerica
      avatar={<QAvatar nombre={lead.nombre} />}
      arribaIzquierda={lead.nombre}
      arribaDerecha={lead.contacto?.nombre || "-"}
      abajoIzquierda={
        <div className="lead-tarjeta-info-columna">
          <span>{lead.email || "-"}</span>
          <span className="lead-tarjeta-secundario">{lead.estado || "-"}</span>
        </div>
      }
      abajoDerecha={
        <div className="lead-tarjeta-info-columna lead-tarjeta-info-columna-derecha">
          <span>{lead.telefono_1 || "-"}</span>
          <span className="lead-tarjeta-secundario">{lead.fuente || "-"}</span>
        </div>
      }
    />
  );
};
