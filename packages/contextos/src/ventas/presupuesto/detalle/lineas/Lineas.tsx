import { EmitirEvento } from "@olula/lib/diseño.js";
import { BorrarLinea } from "../../borrar_linea/BorrarLinea.tsx";
import { CrearLinea } from "../../crear_linea/CrearLinea.tsx";
import { LineaPresupuesto, Presupuesto } from "../../diseño.ts";
import { CambiarLinea } from "../../cambiar_linea/CambiarLinea.tsx";
import { LineasLista } from "./LineasLista.tsx";

export const Lineas = ({
  presupuesto,
  lineaActiva,
  estadoPresupuesto,
  publicar,
}: {
  presupuesto: Presupuesto;
  lineaActiva: LineaPresupuesto | null;
  estadoPresupuesto: string;
  publicar: EmitirEvento;
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

  const handleCambioCantidad = (linea: LineaPresupuesto, cantidad: number) => {
    publicar("cambio_cantidad_linea_solicitado", {
      lineaId: linea.id,
      cantidad: cantidad,
    });
  };

  return (
    <>
      <LineasLista
        lineas={presupuesto.lineas || []}
        seleccionada={lineaActiva?.id}
        onCambioCantidad={handleCambioCantidad}
        presupuestoEditable={
          estadoPresupuesto === "ABIERTO" && !presupuesto.aprobado
        }
        acciones={
          estadoPresupuesto === "ABIERTO" && !presupuesto.aprobado
            ? acciones
            : undefined
        }
        publicar={publicar}
      />

      {estadoPresupuesto === "CREANDO_LINEA" && (
        <CrearLinea presupuestoId={presupuesto.id} publicar={publicar} />
      )}

      {lineaActiva && estadoPresupuesto === "CAMBIANDO_LINEA" && (
        <CambiarLinea
          presupuestoId={presupuesto.id}
          publicar={publicar}
          linea={lineaActiva}
        />
      )}

      {lineaActiva && estadoPresupuesto === "BORRANDO_LINEA" && (
        <BorrarLinea
          presupuestoId={presupuesto.id}
          publicar={publicar}
          linea={lineaActiva}
        />
      )}
    </>
  );
};
