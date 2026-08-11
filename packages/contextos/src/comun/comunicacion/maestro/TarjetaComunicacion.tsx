import { QTarjetaGenerica } from "@olula/componentes/moleculas/qtarjeta_generica.tsx";
import { formatearFechaHora } from "@olula/lib/dominio.js";
import { Comunicacion, ESTADOS_COMUNICACION } from "../diseño.ts";

export const TarjetaComunicacion = (comunicacion: Comunicacion) => {
  const noLeida = comunicacion.estado === ESTADOS_COMUNICACION.NO_LEIDA;
  const claseTexto = noLeida
    ? "comunicacion-tarjeta-texto comunicacion-tarjeta-texto--no-leida"
    : "comunicacion-tarjeta-texto comunicacion-tarjeta-texto--leida";

  const claseFecha = noLeida
    ? "comunicacion-tarjeta-fecha comunicacion-tarjeta-fecha--no-leida"
    : "comunicacion-tarjeta-fecha comunicacion-tarjeta-fecha--leida";

  return (
    <QTarjetaGenerica
      arribaIzquierda={
        <span className="comunicacion-tarjeta-asunto">
          <span
            className={`comunicacion-punto${noLeida ? " comunicacion-punto--no-leida" : " comunicacion-punto--leida"}`}
          />
          <span className={claseTexto}>{comunicacion.asunto}</span>
        </span>
      }
      arribaDerecha={
        <span className={claseFecha}>
          {formatearFechaHora(comunicacion.fechaEnvio)}
        </span>
      }
    />
  );
};
