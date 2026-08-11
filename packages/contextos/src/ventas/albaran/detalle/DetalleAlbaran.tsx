import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { useParams } from "react-router";
import { CambiarDescuento } from "../../comun/componentes/moleculas/CambiarDescuento/CambiarDescuento.tsx";
import { TotalesVenta } from "../../venta/vistas/TotalesVenta.tsx";
import { BorrarAlbaran } from "../borrar/BorrarAlbaran.tsx";
import { Albaran } from "../diseño.ts";
import { albaranVacio, editable, metaAlbaran } from "../dominio.ts";
import "./DetalleAlbaran.css";
import { Lineas } from "./lineas/Lineas.tsx";
import { getMaquina } from "./maquina.ts";
import { TabCliente } from "./TabCliente/TabCliente.tsx";
import { TabDatos } from "./TabDatos.tsx";
import { TabObservaciones } from "./TabObservaciones.tsx";

export const DetalleAlbaran = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const params = useParams();
  const albaranId = id ?? params.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      albaran: albaranVacio(),
      albaranInicial: albaranVacio(),
      lineaActiva: null,
    },
    publicar
  );

  const autoGuardar = useCallback(
    async (modelo: Albaran) => {
      emitir("edicion_de_albaran_lista", modelo);
    },
    [emitir]
  );

  const albaran = useModelo(metaAlbaran, ctx.albaran, autoGuardar);

  useEffect(() => {
    emitir("albaran_id_cambiado", albaranId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albaranId]);

  const { estado, lineaActiva } = ctx;

  const titulo = (albaran: Albaran) => albaran.codigo || "Nuevo Albarán";

  if (!ctx.albaran.id) return;

  const acciones = [
    {
      icono: "eliminar",
      texto: "Borrar",
      advertencia: true,
      onClick: () => emitir("borrar_solicitado"),
    },
  ];

  return (
    <Detalle
      id={ctx.albaran.id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={ctx.albaran}
      cerrarDetalle={() => emitir("albaran_deseleccionado", null)}
    >
      {editable(ctx.albaran) && (
        <QuimeraAcciones acciones={acciones} vertical />
      )}

      <Tabs>
        <Tab label="Cliente">
          <TabCliente albaran={albaran} estado={estado} publicar={emitir} />
        </Tab>

        <Tab label="Datos">
          <TabDatos albaran={albaran} />
        </Tab>

        <Tab label="Observaciones">
          <TabObservaciones albaran={albaran} />
        </Tab>
      </Tabs>

      <TotalesVenta modeloVenta={albaran} publicar={emitir} />

      {estado === "CAMBIANDO_DESCUENTO" && (
        <CambiarDescuento publicar={emitir} venta={ctx.albaran} />
      )}

      <Lineas
        albaran={ctx.albaran}
        lineaActiva={lineaActiva}
        publicar={emitir}
        estadoAlbaran={estado}
      />

      {estado === "BORRANDO_ALBARAN" && (
        <BorrarAlbaran albaran={ctx.albaran} publicar={emitir} />
      )}
    </Detalle>
  );
};
