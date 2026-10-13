import { PanelComprasArticulo } from "#/compras/articulo/detalle/PanelComprasArticulo.tsx";
import { PanelVentasArticulo } from "#/ventas/articulo/detalle/PanelVentasArticulo.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect } from "react";
import { useParams } from "react-router";
import { BorrarArticulo } from "../borrar/BorrarArticulo.tsx";
import { BorrarCajaProveedor } from "../borrar_caja_proveedor/BorrarCajaProveedor.tsx";
import { CambiarCajaProveedor } from "../cambiar_caja_proveedor/CambiarCajaProveedor.tsx";
import { CrearCajaProveedor } from "../crear_caja_proveedor/CrearCajaProveedor.tsx";
import { Articulo } from "../diseño.ts";
import "./DetalleArticulo.css";
import {
  contextoArticuloInicial,
  guardarArticulo,
  metaArticulo,
} from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { TabComponentes } from "./componentes/TabComponentes.tsx";
import { TabGeneral } from "./TabGeneral.tsx";

const titulo = (articulo: Articulo) => articulo.descripcion;

export const DetalleArticulo = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const params = useParams();
  const articuloId = id ?? params.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    contextoArticuloInicial,
    publicar
  );

  const autoGuardar = useCallback(
    async (articulo: Articulo) => {
      await guardarArticulo(ctx, articulo);
      await emitir("articulo_guardado");
    },
    [ctx, emitir]
  );

  const form = useModelo(metaArticulo, ctx.articulo, autoGuardar);

  useEffect(() => {
    emitir("articulo_id_cambiado", articuloId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articuloId]);

  const { estado, articulo, cajaProveedorActiva } = ctx;

  if (!articulo.id) return null;

  const conArticulosCompuestos = pluginActivo("articulos_compuestos");

  const acciones = [
    {
      texto: articulo.seVende ? "Quitar de venta" : "Habilitar para venta",
      onClick: () => emitir("venta_alternada_solicitada"),
    },
    {
      texto: articulo.seCompra ? "Quitar de compra" : "Habilitar para compra",
      onClick: () => emitir("compra_alternada_solicitada"),
    },
    {
      icono: "eliminar",
      texto: "Borrar",
      onClick: () => emitir("borrado_solicitado"),
      advertencia: true,
    },
  ];

  return (
    <Detalle
      id={articulo.id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={articulo}
      cerrarDetalle={() => emitir("articulo_deseleccionado", null)}
    >
      <div className="DetalleArticulo">
        <div className="maestro-botones">
          <QuimeraAcciones acciones={acciones} vertical />
        </div>
        <Tabs
          children={[
            <Tab
              key="tab-general"
              label="General"
              children={<TabGeneral form={form} articulo={articulo} publicar={emitir}/>}
            />,
            puede("ventas.articulo") && articulo.seVende && (
              <Tab
                key="tab-ventas"
                label="Ventas"
                children={<PanelVentasArticulo articuloId={articulo.id} />}
              />
            ),
            puede("compras.articulo") && articulo.seCompra && (
              <Tab
                key="tab-compras"
                label="Compras"
                children={<PanelComprasArticulo articuloId={articulo.id} />}
              />
            ),
            conArticulosCompuestos && (
              <Tab
                key="tab-componentes"
                label="Componentes"
                children={<TabComponentes articuloId={articulo.id} />}
              />
            ),
          ]}
        />
        {estado === "BORRANDO_ARTICULO" && (
          <BorrarArticulo
            articuloId={articulo.id}
            publicar={emitir}
            onCancelar={() => emitir("borrado_cancelado")}
          />
        )}
        {cajaProveedorActiva && estado === "CREANDO_CAJA_PROVEEDOR" && (
          <CrearCajaProveedor
            articuloId={articulo.id}
            proveedorId={cajaProveedorActiva.proveedorId}
            publicar={emitir}
          />
        )}
        {cajaProveedorActiva?.caja && estado === "CAMBIANDO_CAJA_PROVEEDOR" && (
          <CambiarCajaProveedor
            articuloId={articulo.id}
            proveedorId={cajaProveedorActiva.proveedorId}
            caja={cajaProveedorActiva.caja}
            publicar={emitir}
          />
        )}
        {cajaProveedorActiva?.caja && estado === "BORRANDO_CAJA_PROVEEDOR" && (
          <BorrarCajaProveedor
            articuloId={articulo.id}
            proveedorId={cajaProveedorActiva.proveedorId}
            caja={cajaProveedorActiva.caja}
            publicar={emitir}
          />
        )}
      </div>
    </Detalle>
  );
};
