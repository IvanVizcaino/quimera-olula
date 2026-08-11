import { Pedido } from "#/ventas/pedido/diseño.ts";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import {
  QModalConfirmacion,
  QuimeraAcciones,
} from "@olula/componentes/index.ts";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { Criteria, ListaSeleccionable } from "@olula/lib/diseño.js";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { getSeleccionada } from "@olula/lib/entidad.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { LineaAlbaranarPedido as Linea } from "../../diseño.ts";
import { calcularAEnviar } from "../../dominio.ts";
import { EstadoAlbaranarPedido } from "../diseño.ts";
import { puedeAlbaranar } from "../dominio.ts";
import { AccionesLinea } from "./AccionesLinea.tsx";
import { ExpansionTramosSimple } from "./ExpansionTramosSimple.tsx";

export const Lineas = ({
  pedido,
  lineas,
  estado,
  publicar,
}: {
  pedido: Pedido;
  lineas: ListaSeleccionable<Linea>;
  estado: EstadoAlbaranarPedido;
  publicar: ProcesarEvento;
}) => {
  const seleccionada = getSeleccionada(lineas);
  const esConfirmandoAlbaranado = estado === "CONFIRMANDO_ALBARANADO";

  const acciones = [
    {
      texto: "Generar Albaran",
      onClick: () => publicar("albaranado_solicitado"),
      deshabilitado: !puedeAlbaranar({ pedido, lineas }),
    },
  ];

  const metaTabla: MetaTabla<Linea> = {
    cols: [
      {
        id: "linea",
        cabecera: "Línea",
        esTitulo: true,
        render: (l) => `${l.referencia || "-"} ${l.descripcion || ""}`.trim(),
      },
      { id: "cantidad", cabecera: "Cantidad", tipo: "numero" },
      {
        id: "servida",
        cabecera: "Servida",
        tipo: "numero",
        render: (l) => String(l.servida || 0),
      },
      {
        id: "a_enviar",
        cabecera: "A enviar",
        tipo: "numero",
        render: (l) => String(calcularAEnviar(l)),
      },
      {
        id: "acciones",
        cabecera: "",
        render: (l) => (
          <AccionesLinea linea={l} pedidoId={pedido.id} publicar={publicar} />
        ),
      },
    ],
    expansion: ({ entidad }) => (
      <ExpansionTramosSimple linea={entidad} publicar={publicar} />
    ),
  };

  return (
    <div className="DetalleAlbaranarPedido">
      <div className="CabeceraPedido">
        <div className="botones maestro-botones ">
          <QuimeraAcciones acciones={acciones} />
        </div>
      </div>
      <ListadoSemiControlado
        metaTabla={metaTabla}
        entidades={lineas.lista}
        totalEntidades={lineas.lista.length}
        cargando={false}
        seleccionada={seleccionada ?? null}
        onSeleccion={(l: Linea) => publicar("linea_seleccionada", l.id)}
        criteriaInicial={criteria_lineas}
        onCriteriaChanged={() => null}
        modo="tabla"
      />
      <QModalConfirmacion
        nombre="albaranarPedido"
        abierto={esConfirmandoAlbaranado}
        titulo="Confirmar"
        mensaje="¿Está seguro de que desea albaranar este pedido?"
        labelAceptar="Aceptar"
        mostrarCancelar={true}
        onCerrar={() => publicar("albaranado_cancelado")}
        onAceptar={() => publicar("albaranado_confirmado")}
      />
    </div>
  );
};

const criteria_lineas: Criteria = {
  ...criteriaDefecto,
  orden: ["id", "DESC"],
};
