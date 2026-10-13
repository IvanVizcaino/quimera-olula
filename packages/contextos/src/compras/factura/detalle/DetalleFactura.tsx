import { ModalTraza } from "#/comun/componentes/traza/ModalTraza.tsx";
import { CambiarDivisa } from "#/ventas/comun/componentes/moleculas/CambiarDivisa/CambiarDivisa.tsx";
import { CambioProveedor } from "#/compras/comun/componentes/moleculas/CambioProveedor/CambioProveedor.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { imprimir_blob } from "@olula/lib/impresion.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { useCallback, useEffect } from "react";
import { BorrarFactura } from "../borrar/BorrarFactura.tsx";
import { CambiarRectificativa } from "../cambiar_rectificativa/CambiarRectificativa.tsx";
import { Factura } from "../diseño.ts";
import { facturaEditable } from "../dominio.ts";
import {
    getReportFactura,
    getTrazaFactura,
    patchImportacionFactura,
    postLineaIvaImportacion,
} from "../infraestructura.ts";
import {
    contextoDetalleFacturaInicial,
    guardarFactura,
    metaFactura,
} from "./detalle.ts";
import "./DetalleFactura.css";
import { LineasFactura } from "./lineas/LineasFactura.tsx";
import { getMaquina } from "./maquina.ts";
import { TabDatos } from "./TabDatos.tsx";
import { TabObservaciones } from "./TabObservaciones.tsx";
import { TabProveedor } from "./TabProveedor.tsx";
import { TabImportacion } from "./TabImportacion.tsx";
import { TabRecibos } from "./TabRecibos.tsx";
import { TotalesDocumento } from "#/compras/comun/componentes/TotalesDocumento.tsx";

export const DetalleFactura = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleFacturaInicial, publicar);

    const autoGuardar = useCallback(
        async (factura: Factura) => {
            await guardarFactura(ctx, factura);
            await emitir("factura_guardada");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaFactura, ctx.factura, autoGuardar);

    const { estado, factura, lineas } = ctx;

    useEffect(() => {
        emitir("factura_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!factura.id) return null;

    const imprimir = async () => {
        const blob = await getReportFactura(factura.id);
        imprimir_blob(blob);
    };

    const titulo = (f: Factura) =>
        `${f.codigo}${f.nombreProveedor ? ` · ${f.nombreProveedor}` : ""}`;

    const editable = facturaEditable(factura);

    const accionesFactura = [
        { texto: "Imprimir", onClick: imprimir },
        { texto: "Documentos relacionados", onClick: () => emitir("traza_solicitada") },
        editable
            ? { texto: "Cerrar factura", onClick: () => emitir("cierre_solicitado") }
            : { texto: "Reabrir factura", onClick: () => emitir("reapertura_solicitada") },
        {
            texto: "Rectificativa",
            onClick: () => emitir("cambio_rectificativa_solicitado"),
            deshabilitado: !editable,
        },
        {
            icono: "eliminar",
            texto: "Borrar",
            onClick: () => emitir("borrado_solicitado"),
            advertencia: true,
            deshabilitado: !editable,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={factura}
            cerrarDetalle={() => emitir("factura_deseleccionada", null, true)}
        >
            <div className="DetalleFactura">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={accionesFactura} vertical />
                </div>
                <Tabs
                    children={[
                        <Tab
                            key="tab-proveedor"
                            label="Proveedor"
                            children={<TabProveedor form={formModelo} publicar={emitir} />}
                        />,
                        <Tab
                            key="tab-datos"
                            label="Datos"
                            children={<TabDatos form={formModelo} publicar={emitir} />}
                        />,
                        <Tab
                            key="tab-observaciones"
                            label="Observaciones"
                            children={<TabObservaciones form={formModelo} />}
                        />,
                        ...(pluginActivo("facturas_impor")
                            ? [
                                  <Tab
                                      key="tab-importacion"
                                      label="Importación"
                                      children={
                                          <TabImportacion
                                              key={JSON.stringify(factura.importacion)}
                                              factura={factura}
                                              onGuardar={async (cambios) => {
                                                  await patchImportacionFactura(factura.id, cambios);
                                                  await emitir("factura_guardada");
                                              }}
                                              onCrearLineaIva={async () => {
                                                  await postLineaIvaImportacion(factura.id);
                                                  await emitir("factura_guardada");
                                              }}
                                          />
                                      }
                                  />,
                              ]
                            : []),
                        <Tab
                            key="tab-recibos"
                            label="Recibos"
                            children={<TabRecibos facturaId={factura.id} />}
                        />,
                    ]}
                />
                <TotalesDocumento form={formModelo} />
                <LineasFactura
                    factura={factura}
                    lineas={lineas}
                    estado={estado}
                    publicar={emitir}
                />
            </div>

            {estado === "CAMBIANDO_DIVISA" && (
                <CambiarDivisa
                    publicar={emitir}
                    divisaId={factura.divisaId}
                    tasaConversion={factura.tasaConversion}
                />
            )}

            {estado === "CAMBIANDO_PROVEEDOR" && (
                <CambioProveedor
                    documento={factura}
                    onGuardar={async (cambio) => emitir("cambio_proveedor_listo", cambio)}
                    onCancelar={() => emitir("cambio_proveedor_cancelado")}
                />
            )}

            {estado === "BORRANDO" && (
                <BorrarFactura factura={factura} publicar={emitir} />
            )}

            {estado === "CAMBIANDO_RECTIFICATIVA" && (
                <CambiarRectificativa factura={factura} publicar={emitir} />
            )}

            {estado === "VIENDO_TRAZA" && (
              <ModalTraza
                id={ctx.factura.id}
                getTraza={getTrazaFactura}
                onCerrar={() => emitir("traza_cerrada")}
              />
            )}
        </Detalle>
    );
};
