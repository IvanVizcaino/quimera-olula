import { ColumnaEstadoTabla } from "#/comun/componentes/ColumnaEstadoTabla.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QIcono } from "@olula/componentes/index.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { PagoVentaTpv } from "../../diseño.ts";

export const PagosLista = ({
  pagos,
  pagoActivo,
  publicar,
}: {
  pagos: PagoVentaTpv[];
  pagoActivo: PagoVentaTpv | null;
  publicar: EmitirEvento;
}) => {
  const setSeleccionado = (pago: PagoVentaTpv) => {
    publicar("pago_seleccionado", pago);
  };

  return (
    <ListadoSemiControlado
      metaTabla={getMetaTablaPagos()}
      entidades={pagos}
      totalEntidades={pagos.length}
      cargando={false}
      seleccionada={pagoActivo}
      onSeleccion={setSeleccionado}
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      modo="tabla"
    />
  );
};

const getMetaTablaPagos = () => {
  const meta: MetaTabla<PagoVentaTpv> = [
    {
      id: "bloqueado",
      cabecera: "",
      render: (pago: PagoVentaTpv) => (
        <ColumnaEstadoTabla
          estados={{
            abierto,
            cerrado,
          }}
          estadoActual={pago.arqueoAbierto ? "abierto" : "cerrado"}
        />
      ),
    },
    {
      id: "fecha",
      cabecera: "Fecha",
      tipo: "fecha",
    },
    {
      id: "formaPago",
      cabecera: "Forma de pago",
      render: (pago: PagoVentaTpv) =>
        pago.vale
        ? `${pago.formaPago} ${pago.vale}`
        : pago.idTipoTarjeta
          ? `${pago.formaPago} ${pago.idTipoTarjeta}`
          : `${pago.formaPago}`
    },
    { id: "importe", cabecera: "Importe", tipo: "moneda" },
    { id: "idArqueo", cabecera: "Arqueo" },
  ];

  return meta;
};

const abierto = (
  <QIcono
    nombre={"circulo_relleno"}
    tamaño="sm"
    color="var(--color-exito-oscuro)"
  />
);

const cerrado = (
  <QIcono
    nombre={"circulo_relleno"}
    tamaño="sm"
    color="var(--color-deshabilitado-oscuro)"
  />
);
