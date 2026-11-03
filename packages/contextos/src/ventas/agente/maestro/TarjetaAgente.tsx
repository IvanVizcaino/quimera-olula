import { QAvatar, QEtiqueta, QTarjetaGenerica } from "@olula/componentes/index.js";
import { Agente } from "../diseño.ts";
import "./TarjetaAgente.css";

export const TarjetaAgente = (agente: Agente) => (
  <QTarjetaGenerica
    avatar={<QAvatar nombre={agente.nombre} />}
    arribaIzquierda={agente.nombre}
    arribaDerecha={agente.telefono}
    abajoIzquierda={agente.email}
    abajoDerecha={
      <QEtiqueta variante="primario" className="tarjeta-agente-comision">
        {agente.por_comision} %
      </QEtiqueta>
    }
  />
);
