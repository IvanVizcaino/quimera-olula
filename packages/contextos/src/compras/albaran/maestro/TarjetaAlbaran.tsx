import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { QAvatar, QTarjetaGenerica } from "@olula/componentes/index.js";
import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.ts";
import { Albaran } from "../diseño.ts";
import { etiquetaEstadoAlbaran } from "../dominio.ts";

export const TarjetaAlbaran = (albaran: Albaran) => (
  <QTarjetaGenerica
    avatar={<QAvatar nombre={albaran.nombreProveedor || albaran.codigo} />}
    arribaIzquierda={
      albaran.codigo +
      (albaran.nombreProveedor ? ` · ${albaran.nombreProveedor}` : "")
    }
    arribaDerecha={<EtiquetaEstado {...etiquetaEstadoAlbaran(albaran)} />}
    abajoIzquierda={albaran.fecha ? formatearFechaDate(albaran.fecha) : ""}
    abajoDerecha={formatearMoneda(albaran.total, albaran.divisaId)}
  />
);
