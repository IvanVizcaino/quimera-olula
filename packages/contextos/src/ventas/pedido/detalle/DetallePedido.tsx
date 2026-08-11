import { CambiarDescuento } from "#/ventas/comun/componentes/moleculas/CambiarDescuento/CambiarDescuento.tsx";
import { TotalesVenta } from "#/ventas/venta/vistas/TotalesVenta.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { FactoryCtx } from "@olula/lib/factory_ctx.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { BorrarPedido } from "../borrar/BorrarPedido.tsx";
import { Pedido } from "../diseño.ts";
import "./DetallePedido.css";
import { editable, metaPedido, pedidoVacio } from "./detalle.ts";
import { Lineas } from "./lineas/Lineas.tsx";
import { getMaquina } from "./maquina.ts";
import { TabCliente } from "./TabCliente/TabCliente.tsx";
import { TabDatosBase as TabDatos } from "./TabDatos.tsx";
import { TabObservaciones } from "./TabObservaciones.tsx";

export type DetallePedidoProps = {
  id?: string;
  publicar: EmitirEvento;
};

export const DetallePedido = (props: DetallePedidoProps) => {
  const { app } = useContext(FactoryCtx);
  if (!app.Ventas) {
    return null;
  }
  const DetallePedido_ = app.Ventas
    .pedido_DetallePedido as typeof DetallePedidoBase;

  return <DetallePedido_ {...props} />;
};

export const DetallePedidoBase = ({
  id,
  publicar = async () => {},
}: DetallePedidoProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const pedidoId = id ?? params.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      pedido: pedidoVacio(),
      pedidoInicial: pedidoVacio(),
      lineaActiva: null,
    },
    publicar
  );

  const autoGuardar = useCallback(
    async (modelo: Pedido) => {
      emitir("edicion_de_pedido_lista", modelo);
    },
    [emitir]
  );

  const pedido = useModelo(metaPedido, ctx.pedido, autoGuardar);

  useEffect(() => {
    emitir("pedido_id_cambiado", pedidoId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId]);

  const { estado, lineaActiva } = ctx;

  const titulo = (pedido: Pedido) => pedido.codigo || "Nuevo Pedido";

  const handleAlbaranar = useCallback(() => {
    const id = ctx.pedido.id ?? params.id;
    if (id) navigate(`/ventas/albaranar-pedido/${id}`);
  }, [navigate, ctx.pedido, params.id]);

  if (!ctx.pedido.id) return;

  const acciones = [
    {
      texto: "Albaranar",
      onClick: handleAlbaranar,
      deshabilitado: false,
    },
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
      id={ctx.pedido.id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={ctx.pedido}
      cerrarDetalle={() => emitir("pedido_deseleccionado", null)}
    >
      {editable(ctx.pedido) && <QuimeraAcciones acciones={acciones} vertical />}

      <Tabs>
        <Tab label="Cliente">
          <TabCliente pedido={pedido} estado={estado} publicar={emitir} />
        </Tab>

        <Tab label="Datos">
          <TabDatos pedido={pedido} />
        </Tab>

        <Tab label="Observaciones">
          <TabObservaciones pedido={pedido} />
        </Tab>
      </Tabs>

      <TotalesVenta modeloVenta={pedido} publicar={emitir} />

      {estado === "CAMBIANDO_DESCUENTO" && (
        <CambiarDescuento publicar={emitir} venta={ctx.pedido} />
      )}

      <Lineas
        pedido={ctx.pedido}
        lineaActiva={lineaActiva}
        publicar={emitir}
        estadoPedido={estado}
      />

      {estado === "BORRANDO_PEDIDO" && (
        <BorrarPedido pedido={ctx.pedido} publicar={emitir} />
      )}
    </Detalle>
  );
};
