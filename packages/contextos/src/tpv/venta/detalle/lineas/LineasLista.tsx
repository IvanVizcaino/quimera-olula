import { divisaTpv } from "#/tpv/comun/dominio.ts";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearMoneda } from "@olula/lib/dominio.js";
import { LineaFactura as Linea, LineaFactura } from "../../diseño.ts";

export const LineasLista = ({
  lineas,
  seleccionada,
  publicar,
}: {
  lineas: Linea[];
  seleccionada?: string;
  publicar: EmitirEvento;
}) => {
  // const { intentar } = useContext(ContextoError);

  // const cambiarCantidad = async (linea: Linea, cantidad: number) => {
  //   await intentar(() => patchCantidadLinea(idFactura, linea, cantidad));
  //   publicar("linea_cambiada");
  // };

  const setSeleccionada = (linea: Linea) => {
    publicar("linea_seleccionada", linea);
  };

  return (
    <ListadoSemiControlado
      metaTabla={getMetaTablaLineas()}
      entidades={lineas}
      totalEntidades={lineas.length}
      cargando={false}
      seleccionada={lineas.find((linea) => linea.id === seleccionada) ?? null}
      onSeleccion={setSeleccionada}
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      modo="tabla"
    />
  );
};

export const LineaVenta = ({
  linea,
  // seleccionada,
  // emitir,
  // idFactura,
  // refrescarCabecera,
}: {
  linea: Linea;
  // seleccionada?: string;
  // emitir: EmitirEvento;
  // idFactura: string;
  // refrescarCabecera: () => void;
}) => {
  // const { intentar } = useContext(ContextoError);
  // const cambiarCantidad = async (linea: Linea, cantidad: number) => {
  //   await intentar(() => patchCantidadLinea(idFactura, linea, cantidad));
  //   refrescarCabecera();
  // };

  // const setSeleccionada = (linea: Linea) => {
  //   emitir("linea_seleccionada", linea);
  // };

  return (
    <>
      {`${linea.referencia}: ${linea.descripcion}. ${linea.cantidad} x ${linea.pvp_unitario}€ = ${linea.pvp_total}€ ${
        linea.dto_porcentual ? `(Descuento ${linea.dto_porcentual}%)` : ""
      }`}
    </>
  );
};

const getMetaTablaLineas = () => {
  const meta: MetaTabla<LineaFactura> = [
    {
      id: "linea",
      cabecera: "Lineas",
      render: (linea: Linea) => `${linea.referencia}: ${linea.descripcion}`,
    },
    { id: "pvp_unitario", cabecera: "Precio", tipo: "moneda" },
    { id: "cantidad", cabecera: "Cantidad", tipo: "numero" },
    {
      id: "dto_porcentual",
      cabecera: "Dto.",
      tipo: "numero",
      render: (linea: Linea) =>
        linea.dto_porcentual && linea.dto_lineal
          ? `${linea.dto_porcentual}% + ${formatearMoneda(linea.dto_lineal, divisaTpv)}`
          : linea.dto_lineal
          ? `${formatearMoneda(linea.dto_lineal, divisaTpv)}`
          : linea.dto_porcentual ? `${linea.dto_porcentual}%` : "",
    },
    { id: "pvp_total", cabecera: "Total", tipo: "moneda" },
  ];

  return meta;
};
