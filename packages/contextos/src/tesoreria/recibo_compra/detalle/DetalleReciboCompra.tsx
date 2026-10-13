import { ModalTraza } from "#/comun/componentes/traza/ModalTraza.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { bancaActiva } from "../../comun/banca.js";
import { ReciboCompra } from "../diseño.js";
import { reciboCompraAnulable, reciboCompraDevolvible, reciboCompraPagable } from "../dominio.js";
import { getTrazaReciboCompra } from "../infraestructura.ts";
import {
  contextoDetalleReciboCompraInicial,
  metaReciboCompra,
} from "./detalle.js";
import "./DetalleReciboCompra.css";
import { AnularPagoReciboCompra } from "./anular_pago/AnularPagoReciboCompra.tsx";
import { DevolverReciboCompra } from "./devolver/DevolverReciboCompra.tsx";
import { getMaquina } from "./maquina.js";
import { OrdenarPagoReciboCompra } from "./ordenar_pago/OrdenarPagoReciboCompra.tsx";
import { PagarReciboCompra } from "./pagar/PagarReciboCompra.tsx";
import { PagosReciboCompra } from "./pagos/PagosReciboCompra.tsx";

export const DetalleReciboCompra = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const { ctx, emitir } = useMaquina(
    getMaquina,
    contextoDetalleReciboCompraInicial,
    publicar
  );

  const { uiProps } = useModelo(metaReciboCompra, ctx.recibo);

  useEffect(() => {
    emitir("recibo_id_cambiado", id, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!ctx.recibo.id) return null;

  const titulo = (r: ReciboCompra) => r.codigo || `Recibo ${r.id}`;
  const bancaHabilitada = bancaActiva();

  const accionPrincipal = reciboCompraDevolvible(ctx.recibo)
    ? {
        texto: "Devolver",
        onClick: () => emitir("devolucion_solicitada"),
      }
    : {
        texto: "Registrar pago",
        onClick: () => emitir("pagar_solicitado"),
        deshabilitado: !reciboCompraPagable(ctx.recibo),
      };

  const acciones = [
    accionPrincipal,
    bancaHabilitada && {
      texto: "Pagar al proveedor (banco)",
      onClick: () => emitir("ordenar_pago_solicitado"),
      deshabilitado: !reciboCompraPagable(ctx.recibo),
    },
    {
      texto: "Anular pago",
      onClick: () => emitir("anular_pago_solicitado"),
      deshabilitado: !reciboCompraAnulable(ctx.recibo),
      advertencia: true,
    },
  ];

  return (
    <Detalle
      id={id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={ctx.recibo}
      cerrarDetalle={() => emitir("recibo_deseleccionado", null, true)}
    >
      <div className="DetalleReciboCompra">
        <QuimeraAcciones acciones={acciones} vertical />

        <quimera-formulario>
          <QInput label="Código" {...uiProps("codigo")} />
          <QInput label="Estado" {...uiProps("estado")} />
          <QInput label="Importe" {...uiProps("importe")} />
          <QInput label="Fecha de emisión" {...uiProps("fechaEmision")} />
          <QInput label="Fecha de vencimiento" {...uiProps("fechaVencimiento")} />
          <QInput label="Proveedor" {...uiProps("nombreProveedor")} />
          <QInput label="ID Fiscal" {...uiProps("idFiscal")} />
          <QInput label="Factura" {...uiProps("facturaId")} />
        </quimera-formulario>

        <PagosReciboCompra pagos={ctx.recibo.pagos} />

        {ctx.estado === "PAGANDO" && <PagarReciboCompra publicar={emitir} />}

        {ctx.estado === "DEVOLVIENDO" && (
          <DevolverReciboCompra recibo={ctx.recibo} publicar={emitir} />
        )}

        {ctx.estado === "ANULANDO_PAGO" && (
          <AnularPagoReciboCompra recibo={ctx.recibo} publicar={emitir} />
        )}

        {ctx.estado === "ORDENANDO_PAGO" && (
          <OrdenarPagoReciboCompra recibo={ctx.recibo} publicar={emitir} />
        )}

        {ctx.estado === "VIENDO_TRAZA" && (
          <ModalTraza
            id={ctx.recibo.id}
            getTraza={getTrazaReciboCompra}
            onCerrar={() => emitir("traza_cerrada")}
          />
        )}
      </div>
    </Detalle>
  );
};
