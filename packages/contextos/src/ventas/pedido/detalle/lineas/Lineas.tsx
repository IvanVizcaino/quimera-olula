import { BorrarLinea } from "../../borrar_linea/BorrarLinea.tsx";
import { CrearLinea } from "../../crear_linea/CrearLinea.tsx";
import { LineaPedido, Pedido } from "../../diseño.ts";
import { CambiarLinea } from "../../cambiar_linea/CambiarLinea.tsx";
import { LineasLista } from "./LineasLista.tsx";

export const Lineas = ({
  pedido,
  lineaActiva,
  estadoPedido,
  publicar,
}: {
  pedido: Pedido;
  lineaActiva: LineaPedido | null;
  estadoPedido: string;
  publicar: (evento: string, payload?: unknown) => void;
}) => {
  const acciones = [
    {
      texto: "Nueva",
      onClick: () => publicar("alta_linea_solicitada"),
    },
    {
      texto: "Editar",
      onClick: () => publicar("cambio_linea_solicitado"),
      deshabilitado: !lineaActiva,
    },
    {
      icono: "eliminar",
      texto: "Borrar",
      advertencia: true,
      onClick: () => publicar("baja_linea_solicitada"),
      deshabilitado: !lineaActiva,
    },
  ];

  const handleCambioCantidad = (linea: LineaPedido, cantidad: number) => {
    publicar("cambio_cantidad_linea_solicitado", {
      lineaId: linea.id,
      cantidad: cantidad,
    });
  };

  return (
    <>
      <LineasLista
        key={pedido.id}
        lineas={pedido.lineas || []}
        seleccionada={lineaActiva?.id}
        onCambioCantidad={handleCambioCantidad}
        pedidoEditable={estadoPedido === "ABIERTO" && pedido.servido != "TOTAL"}
        acciones={
          estadoPedido === "ABIERTO" && pedido.servido != "TOTAL"
            ? acciones
            : undefined
        }
        publicar={publicar}
      />

      {estadoPedido === "CREANDO_LINEA" && (
        <CrearLinea pedidoId={pedido.id} publicar={publicar} />
      )}

      {lineaActiva && estadoPedido === "CAMBIANDO_LINEA" && (
        <CambiarLinea
          pedidoId={pedido.id}
          publicar={publicar}
          linea={lineaActiva}
        />
      )}

      {lineaActiva && estadoPedido === "BORRANDO_LINEA" && (
        <BorrarLinea
          pedidoId={pedido.id}
          publicar={publicar}
          linea={lineaActiva}
        />
      )}
    </>
  );
};
