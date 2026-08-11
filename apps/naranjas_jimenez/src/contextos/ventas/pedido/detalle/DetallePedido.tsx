import { BorrarPedido } from "#/ventas/pedido/borrar/BorrarPedido.tsx";
import { editable, getMetaPedido } from "#/ventas/pedido/detalle/detalle.ts";

import { Lineas } from "#/ventas/pedido/detalle/lineas/Lineas.tsx";
import { getMaquina } from "#/ventas/pedido/detalle/maquina.ts";
import { TabObservaciones } from "#/ventas/pedido/detalle/TabObservaciones.tsx";
import { Pedido } from "#/ventas/pedido/diseño.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { useParams } from "react-router";
import { Agente } from "../../comun/componentes/Agente.tsx";
import "./DetallePedido.css";

import { HookModelo } from "@olula/lib/useModelo.ts";
import { PedidoNrj } from "../diseño.ts";
import { pedidoVacioNrj } from "../dominio.ts";
import { TabClienteNrj } from "./TabCliente/TabCliente.tsx";

const metaPedidoNrj = {
  ...getMetaPedido<PedidoNrj>(),
  campos: {
    ...getMetaPedido<PedidoNrj>().campos,
    portes_cliente: { tipo: "checkbox" as const, requerido: false },
  },
};

export const DetallePedidoNrj = ({
  publicar = async () => {},
  id,
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const params = useParams();
  //const navigate = useNavigate();
  const pedidoId = id ?? params.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      pedido: pedidoVacioNrj(),
      pedidoInicial: pedidoVacioNrj(),
      lineaActiva: null,
    },
    publicar
  );

  const pedido = useModelo(metaPedidoNrj, ctx.pedido as PedidoNrj);

  useEffect(() => {
    emitir("pedido_id_cambiado", pedidoId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId]);

  const { estado, lineaActiva } = ctx;

  const titulo = (pedido: Pedido) => pedido.codigo || "Nuevo Pedido";

  const handleGuardar = useCallback(() => {
    emitir("edicion_de_pedido_lista", pedido.modelo);
  }, [emitir, pedido]);

  const handleCancelar = useCallback(() => {
    emitir("edicion_de_pedido_cancelada");
  }, [emitir]);

  const acciones = [
    /*     {
      texto: "Albaranar",
      onClick: handleAlbaranar,
      deshabilitado: false,
    }, */
    {
      icono: "eliminar",
      texto: "Borrar",
      advertencia: true,
      onClick: () => emitir("borrar_solicitado"),
      deshabilitado: false,
    },
  ];

  return (
    <Detalle
      id={pedidoId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={ctx.pedido}
      cerrarDetalle={() => publicar("pedido_deseleccionado", null)}
    >
      {!!pedidoId && (
        <>
          {/* <div className="acciones-rapidas">
            <QBoton tipo="reset" variante="texto" onClick={handleBorrar}>
              Borrar
            </QBoton>
          </div> */}
          {editable(ctx.pedido) && (
            <QuimeraAcciones acciones={acciones} vertical />
          )}

          <Tabs>
            <Tab label="Cliente">
              <TabClienteNrj
                pedido={pedido}
                estado={estado}
                publicar={emitir}
              />
            </Tab>

            <Tab label="Datos">
              <TabDatosNrj pedido={pedido} />
            </Tab>

            <Tab label="Observaciones">
              <TabObservaciones pedido={pedido} />
            </Tab>
          </Tabs>

          {editable(ctx.pedido) && pedido.modificado && (
            <div className="botones maestro-botones">
              <QBoton onClick={handleGuardar}>Guardar Cambios</QBoton>
              <QBoton tipo="reset" variante="texto" onClick={handleCancelar}>
                Cancelar
              </QBoton>
            </div>
          )}

          {/*           <TotalesVenta
            neto={Number(ctx.pedido.neto ?? 0)}
            totalIva={Number(ctx.pedido.total_iva ?? 0)}
            total={Number(ctx.pedido.total ?? 0)}
            divisa={String(ctx.pedido.coddivisa ?? "EUR")}
          /> */}

          <Lineas
            pedido={ctx.pedido}
            lineaActiva={lineaActiva}
            publicar={emitir}
            estadoPedido={estado}
          />

          {estado === "BORRANDO_PEDIDO" && (
            <BorrarPedido pedido={ctx.pedido} publicar={emitir} />
          )}
        </>
      )}
    </Detalle>
  );
};

export interface TabDatosProps {
  pedido: HookModelo<PedidoNrj>;
}

export const TabDatosNrj = ({ pedido }: TabDatosProps) => {
  const { uiProps } = pedido;

  return (
    <div className="TabDatos">
      <quimera-formulario>
        <QDate label="Fecha" {...uiProps("fecha")} />
        <div id="espacio_fecha" />
        {/*         <Divisa {...uiProps("divisa_id")} />
        <QInput label="T. Conversión" {...uiProps("tasa_conversion")} />
        <QInput {...uiProps("total_divisa_empresa")} label="Total €" /> */}
        <Agente {...uiProps("agente_id", "nombre_agente")} />
        <div id="espacio_agente" />
        {/*         <FormaPago {...uiProps("forma_pago_id", "nombre_forma_pago")} />
        <GrupoIvaNegocio {...uiProps("grupo_iva_negocio_id")} /> */}
      </quimera-formulario>
    </div>
  );
};
