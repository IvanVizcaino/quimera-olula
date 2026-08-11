import { BorrarLineaVentaTpv } from "#/tpv/venta/borrar_linea/BorrarLineaVentaTpv.tsx";
import { CrearLineaVentaTpv } from "#/tpv/venta/crear_linea/CrearLineaVentaTpv.tsx";
import { VentaTpv } from "#/tpv/venta/diseño.ts";
import { LineaFactura } from "#/ventas/factura/diseño.ts";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { CambiarLineaTpv } from "../../cambiar_linea/CambiarLineaTpv.tsx";
import { EstadoVentaTpv } from "../detalle.ts";
import "./Lineas.css";
import { AltaRapida } from "./alta_rapida/AltaRapida.tsx";
import { LineasLista } from "./LineasLista.tsx";
export const Lineas = ({
  venta,
  lineas,
  estadoVenta,
  publicar,
}: {
  venta: VentaTpv;
  lineas: ListaEntidades<LineaFactura>;
  estadoVenta: EstadoVentaTpv;
  publicar: EmitirEvento;
}) => {
  const accionStock = !!lineas.activo?.referencia && {
    texto: "Stock",
    onClick: () =>
      window.open(
        `/almacen/stock?articulo_id==__${lineas.activo!.referencia}`,
        "_blank"
      ),
  };

  const accionesLineas = [
    venta.total >= 0 && {
      texto: "Devolución",
      onClick: () => publicar("devolucion_solicitada"),
      variante: "borde" as const,
    },
    {
      texto: "Nueva",
      onClick: () => publicar("alta_linea_solicitada"),
    },
    {
      texto: "Editar",
      onClick: () => publicar("cambio_linea_solicitado"),
      deshabilitado: !lineas.activo,
    },
    {
      texto: "Borrar",
      onClick: () => publicar("baja_linea_solicitada"),
      deshabilitado: !lineas.activo,
      advertencia: true,
    },
    accionStock,
  ];

  return (
    <>
      {estadoVenta !== "EMITIDA" && (
        <div className="lineas-venta-tpv">
          <AltaRapida publicar={publicar} />
          <div className="botones maestro-botones">
            <QuimeraAcciones acciones={accionesLineas} />
          </div>
        </div>
      )}
      {estadoVenta === "EMITIDA" && accionStock && (
        <div className="botones maestro-botones">
          <QuimeraAcciones acciones={[accionStock]} />
        </div>
      )}
      <LineasLista
        lineas={lineas.lista}
        seleccionada={lineas.activo?.id}
        publicar={publicar}
      />
      {estadoVenta === "CREANDO_LINEA" && (
        <CrearLineaVentaTpv venta={venta} publicar={publicar} />
      )}
      {lineas.activo && estadoVenta === "CAMBIANDO_LINEA" && (
        <CambiarLineaTpv
          venta={venta}
          publicar={publicar}
          linea={lineas.activo}
        />
      )}
      {lineas.activo && estadoVenta === "BORRANDO_LINEA" && (
        <BorrarLineaVentaTpv
          venta={venta}
          publicar={publicar}
          idLinea={lineas.activo.id}
        />
      )}
    </>
  );
};
