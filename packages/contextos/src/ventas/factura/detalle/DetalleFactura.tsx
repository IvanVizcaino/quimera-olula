import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { useParams } from "react-router";
import { CambiarDescuento } from "../../comun/componentes/moleculas/CambiarDescuento/CambiarDescuento.tsx";
import { TotalesVenta } from "../../venta/vistas/TotalesVenta.tsx";
import { BorrarFactura } from "../borrar/BorrarFactura.tsx";
import { Factura } from "../diseño.ts";
import { facturaVacia } from "../dominio.ts";
import "./DetalleFactura.css";
import { editable, metaFactura } from "./diseño.ts";
import { Lineas } from "./Lineas/Lineas.tsx";
import { getMaquina } from "./maquina.ts";
import { TabCliente } from "./TabCliente/TabCliente.tsx";
import { TabDatos } from "./TabDatos.tsx";
import { TabObservaciones } from "./TabObservaciones.tsx";

export const DetalleFactura = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const params = useParams();
  const facturaId = id ?? params.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      factura: facturaVacia(),
      facturaInicial: facturaVacia(),
      lineaActiva: null,
    },
    publicar
  );

  const autoGuardar = useCallback(
    async (modelo: Factura) => {
      emitir("edicion_de_factura_lista", modelo);
    },
    [emitir]
  );

  const factura = useModelo(metaFactura, ctx.factura, autoGuardar);

  useEffect(() => {
    emitir("factura_id_cambiado", facturaId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facturaId]);

  const { estado, lineaActiva } = ctx;

  const titulo = (factura: Factura) => factura.codigo || "Nueva Factura";

  const handleBorrar = useCallback(() => {
    emitir("borrar_solicitado");
  }, [emitir]);

  if (!ctx.factura.id) return;

  return (
    <Detalle
      id={ctx.factura.id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={ctx.factura}
      cerrarDetalle={() => emitir("factura_deseleccionada", null)}
    >
      {editable(ctx.factura) && (
        <div className="acciones-rapidas">
          <QBoton tipo="reset" variante="texto" onClick={handleBorrar}>
            Borrar
          </QBoton>
        </div>
      )}

      <Tabs>
        <Tab label="Cliente">
          <TabCliente factura={factura} publicar={emitir} />
        </Tab>

        <Tab label="Datos">
          <TabDatos factura={factura} />
        </Tab>

        <Tab label="Observaciones">
          <TabObservaciones factura={factura} />
        </Tab>
      </Tabs>

      <TotalesVenta modeloVenta={factura} publicar={emitir} />

      {estado === "CAMBIANDO_DESCUENTO" && (
        <CambiarDescuento publicar={emitir} venta={ctx.factura} />
      )}

      <Lineas
        factura={ctx.factura}
        lineaActiva={lineaActiva}
        estadoFactura={estado}
        publicar={emitir}
      />

      {estado === "BORRANDO_FACTURA" && (
        <BorrarFactura factura={ctx.factura} publicar={emitir} />
      )}
    </Detalle>
  );
};
