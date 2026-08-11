import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { LineaAlbaran as Linea } from "../../diseño.ts";
import { EditarCantidadLinea } from "./EditarCantidadLinea.tsx";
import { TarjetaLinea } from "./TarjetaLinea.tsx";

export const LineasLista = ({
  lineas,
  seleccionada,
  onCambioCantidad,
  albaranEditable,
  cantidadEditable = false,
  acciones,
  publicar,
}: {
  lineas: Linea[];
  seleccionada?: string;
  onCambioCantidad?: (linea: Linea, cantidad: number) => void;
  albaranEditable?: boolean;
  cantidadEditable?: boolean;
  acciones?: Parameters<typeof QuimeraAcciones>[0]["acciones"];
  publicar: (evento: string, payload?: unknown) => void;
}) => {
  const setSeleccionada = (linea: Linea) => {
    if (!albaranEditable) return;
    publicar("linea_seleccionada", linea);
  };

  return (
    <ListadoSemiControlado
      metaTabla={getMetaTablaLineas(onCambioCantidad, cantidadEditable)}
      tarjeta={(linea) => (
        <TarjetaLinea
          linea={linea}
          cantidadEditable={cantidadEditable}
          onCambioCantidad={onCambioCantidad}
        />
      )}
      entidades={lineas}
      totalEntidades={lineas.length}
      cargando={false}
      seleccionada={lineas.find((linea) => linea.id === seleccionada) ?? null}
      onSeleccion={setSeleccionada}
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      renderAcciones={() =>
        albaranEditable && acciones && acciones.length > 0 ? (
          <div className="botones maestro-botones ">
            <QuimeraAcciones acciones={acciones} />
          </div>
        ) : null
      }
    />
  );
};

const getMetaTablaLineas = (
  onCambioCantidad?: (linea: Linea, cantidad: number) => void,
  cantidadEditable = false
) => {
  return [
    {
      id: "linea",
      cabecera: "Línea",
      render: (linea: Linea) => `${linea.referencia}: ${linea.descripcion}`,
    },
    {
      id: "cantidad",
      cabecera: "Cantidad",
      tipo: "numero" as const,
      render: (linea: Linea) =>
        cantidadEditable && onCambioCantidad ? (
          <EditarCantidadLinea
            linea={linea}
            onCantidadEditada={onCambioCantidad}
          />
        ) : (
          <span>{linea.cantidad}</span>
        ),
    },
    {
      id: "pvp_unitario",
      cabecera: "Precio",
      tipo: "moneda" as const,
    },
    {
      id: "grupo_iva_producto_id",
      cabecera: "IVA",
    },
    {
      id: "dto_porcentual",
      cabecera: "% Dto.",
      render: (linea: Linea) =>
        linea.dto_porcentual ? `${linea.dto_porcentual}%` : "",
    },
    {
      id: "pvp_total",
      cabecera: "Total",
      tipo: "moneda" as const,
    },
  ];
};
