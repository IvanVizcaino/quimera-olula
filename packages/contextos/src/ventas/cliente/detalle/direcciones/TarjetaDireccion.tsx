import { QEtiqueta, QTarjetaGenerica } from "@olula/componentes/index.js";
import { formatearDireccionUnaLinea } from "@olula/lib/dominio.ts";
import { DirCliente } from "../../diseño.ts";

const ubicacion = (direccion: DirCliente) =>
  [
    direccion.cod_postal,
    direccion.provincia,
    direccion.pais_id ? `(${direccion.pais_id})` : "",
  ]
    .filter(Boolean)
    .join(" ");

export const TarjetaDireccion = (direccion: DirCliente) => {
  return (
    <QTarjetaGenerica
      arribaIzquierda={formatearDireccionUnaLinea(direccion)}
      arribaDerecha={
        <span className="TarjetaDireccion-marcas">
          {direccion.dir_facturacion && (
            <QEtiqueta variante="primario">Facturación</QEtiqueta>
          )}
          {direccion.dir_envio && <QEtiqueta variante="exito">Envío</QEtiqueta>}
        </span>
      }
      abajoIzquierda={ubicacion(direccion)}
      abajoDerecha={
        direccion.telefono ? `Tel: ${direccion.telefono}` : undefined
      }
    />
  );
};
