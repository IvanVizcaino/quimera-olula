import { CambiarDescuento } from "#/ventas/comun/componentes/moleculas/CambiarDescuento/CambiarDescuento.tsx";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { TotalesVenta } from "#/ventas/venta/vistas/TotalesVenta.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, Tab, Tabs } from "@olula/componentes/index.js";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { abrirCajon } from "@olula/lib/impresion.ts";
import { listaEntidadesInicial } from "@olula/lib/ListaEntidades.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { botonOculto } from "#/tpv/config/dominio.ts";
import { useOpcionesTpv } from "#/tpv/config/useOpcionesTpv.ts";
import { SiguienteVentaTpv } from "../siguiente_venta/SiguienteVentaTpv.tsx";
import { PasoSiguienteVenta, primerPasoSiguienteVenta } from "../impresion.ts";
import { BorrarVentaTpv } from "../borrar/BorrarVentaTpv.tsx";
import { CambiarTotalVentaTpv } from "../cambiar_total/CambiarTotalVentaTpv.tsx";
import { BorrarPagoVentaTpv } from "../borrar_pago/BorrarPagoVentaTpv.tsx";
import { DevolverVentaTpv } from "../devolver/DevolverVentaTpv.tsx";
import { LineaFactura, PagoVentaTpv, VentaTpv } from "../diseño.ts";
import { ventaTpvVacia } from "../dominio.ts";
import { EmitirVentaTpv } from "../emitir/EmitirVentaTpv.tsx";
import { PagarTarjetaVentaTpv } from "../pagar_con_tarjeta/PagarTarjetaVentaTpv.tsx";
import { PagoValeVentaTpv } from "../pagar_con_vale/PagoValeVentaTpv.tsx";
import { PagarEfectivoVentaTpv } from "../pagar_en_efectivo/PagarEfectivoVentaTpv.tsx";
import { TiqueRegaloVentaTpv } from "../tique_regalo/TiqueRegaloVentaTpv.tsx";
import { PendienteVenta } from "./comps/PendienteVenta.tsx";
import { ContextoVentaTpv, guardarVenta, imprimirTicketOFactura, imprimirVale, metaVentaTpv } from "./detalle.ts";
import { Lineas } from "./lineas/Lineas.tsx";
import { getMaquina } from "./maquina.ts";
import { Pagos } from "./pagos/Pagos.tsx";
import { TabCliente } from "./tabs/TabCliente.tsx";

export const DetalleVentaTpv = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
    const contextoInicial: ContextoVentaTpv = {
        estado: "INICIAL",
        venta: ventaTpvVacia,
        pagos: listaEntidadesInicial<PagoVentaTpv>(),
        lineas: listaEntidadesInicial<LineaFactura>(),
    };

    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial, publicar);

    const autoGuardar = useCallback(
        async (venta: VentaTpv) => {
            await guardarVenta(ctx, venta);
            await emitir("venta_guardada");
        },
        [ctx, emitir]
    );

    const modeloVenta = useModelo(metaVentaTpv, ctx.venta, autoGuardar);

    useEffect(() => {
        emitir("venta_id_cambiada", id, true);
    }, [id]);

    const opciones = useOpcionesTpv();
    const [pasoSiguiente, setPasoSiguiente] = useState<PasoSiguienteVenta>(null);

    const avanceForzado = useRef(false);
    const estadoAnterior = useRef(ctx.estado); // Referencia para saber cuándo imprimir el tique
    useEffect(() => {
        const estadosPago = ["PAGANDO_EN_EFECTIVO", "PAGANDO_CON_TARJETA", "PAGANDO_CON_VALE"];
        const anterior = estadoAnterior.current;
        estadoAnterior.current = ctx.estado;
        if (ctx.estado !== 'EMITIDA') return;
        const cobrada = estadosPago.includes(anterior) && ctx.venta.pendiente === 0;
        // ABIERTA -> EMITIDA directo solo ocurre al emitir un vale (que ya imprime por sí mismo)
        const valeEmitido = anterior === 'ABIERTA';
        if (!cobrada && !valeEmitido) return;
        (async () => {
            if (cobrada && opciones.imprimirTiqueAlCobrar) {
                await imprimirTicketOFactura(ctx.venta, ctx.pagos.lista);
            }
            // Orden de Eneboo (pbnPagar_clicked): imprimir, abrir cajón, pasar a la siguiente
            if (cobrada && opciones.abrirCajonAlCobrar) {
                abrirCajon();
            }
            const paso = primerPasoSiguienteVenta(ctx.venta, opciones);
            // Crema: tras emitir un vale se avanza siempre (aunque se cancele la confirmación
            // o rvpasarsiguiente esté desactivado)
            avanceForzado.current = valeEmitido && opciones.emitirValeAvanzaSiempre;
            if (paso) setPasoSiguiente(paso);
            else if (avanceForzado.current) publicar("crear_venta_solicitada");
        })();
    }, [ctx.estado, ctx.venta]);

    if (!ctx.venta.id) return;

    const imprimir = async () => {
        await imprimirTicketOFactura(ctx.venta, ctx.pagos.lista);
    };

    const imprimir_vale = async () => {
        await imprimirVale(ctx.venta.codigo);
    };

    const { estado, pagos, lineas, venta } = ctx;

    const titulo = (venta: Entidad) => venta.codigo as string;

    return (
        <Detalle
        id={id}
        obtenerTitulo={titulo}
        setEntidad={() => {}}
        entidad={venta}
        cerrarDetalle={() => emitir("venta_deseleccionada", null, true)}
        >
        <div className="DetalleFactura">
            <div className="botones maestro-botones ">
            {estado !== "EMITIDA" && (
                <QBoton
                texto="Borrar venta"
                onClick={() => emitir("borrar_solicitado")}
                />
            )}
            <QBoton texto="Imprimir" onClick={imprimir} />
            <QBoton texto="Cajón" onClick={abrirCajon} />
            {estado === "ABIERTA" && (
                <QBoton
                texto="Emitir"
                onClick={() => emitir("emision_solicitada")}
                />
            )}
            {estado == "EMITIDA" && venta.total > 0 && (
                <QBoton
                texto="Tique regalo"
                onClick={() => emitir("tique_regalo_solicitado")}
                />
            )}
            {estado == "EMITIDA" && venta.total < 0 && (
                <QBoton
                texto="Imprimir vale"
                onClick={imprimir_vale}
                />
            )}
            </div>
            <Tabs
            children={[
                <Tab
                    key="tab-1"
                    label="Cliente"
                    children={
                        <TabCliente
                            venta={venta}
                            estado={estado}
                            form={modeloVenta}
                            publicar={emitir}
                        />
                    }
                />,
                <Tab
                    key="tab-3"
                    label="Pagos"
                    children={
                        <Pagos
                            pagoActivo={pagos.activo}
                            pagos={pagos.lista}
                            publicar={emitir}
                        />
                    }
                />,
            ]}
            ></Tabs>

            <TotalesVenta publicar={emitir} modeloVenta={modeloVenta} ocultarDescuento={botonOculto(opciones, "descuento")} />

            {estado === "ABIERTA" && pluginActivo("dto_cabecera_venta", "eneboo") && (
                <div className="botones maestro-botones">
                    <QBoton
                        texto="Cambiar total"
                        onClick={() => emitir("total_solicitado")}
                    />
                </div>
            )}

            {estado === "CAMBIANDO_DESCUENTO" && (
                <CambiarDescuento publicar={emitir} venta={venta}/>
            )}

            {estado === "CAMBIANDO_TOTAL" && (
                <CambiarTotalVentaTpv publicar={emitir} venta={venta} />
            )}

            {venta.pendiente !== 0 && (
                <PendienteVenta publicar={emitir} venta={venta} />
            )}
            <Lineas
                lineas={lineas}
                venta={venta}
                publicar={emitir}
                estadoVenta={estado}
            />
            {estado === "BORRANDO_VENTA" && (
                <BorrarVentaTpv publicar={emitir} venta={venta} />
            )}
            {estado === "EMITIENDO_VENTA" && (
                <EmitirVentaTpv publicar={emitir} venta={venta} />
            )}
            {estado === "PAGANDO_EN_EFECTIVO" && (
                <PagarEfectivoVentaTpv publicar={emitir} venta={venta} />
            )}
            {estado === "PAGANDO_CON_TARJETA" && (
                <PagarTarjetaVentaTpv publicar={emitir} venta={venta} />
            )}
            {estado === "PAGANDO_CON_VALE" && (
                <PagoValeVentaTpv publicar={emitir} venta={venta} />
            )}
            {estado === "BORRANDO_PAGO" && pagos.activo && (
                <BorrarPagoVentaTpv
                    publicar={emitir}
                    venta={venta}
                    idPago={pagos.activo.id}
                />
            )}
            {estado === "DEVOLVIENDO_VENTA" && (
                <DevolverVentaTpv venta={venta} publicar={emitir} />
            )}
            {estado === "GENERANDO_TIQUE_REGALO" && (
                <TiqueRegaloVentaTpv venta={venta} lineas={lineas.lista} publicar={emitir} />
            )}
            {pasoSiguiente && (
                <SiguienteVentaTpv
                    venta={venta}
                    lineas={lineas.lista}
                    opciones={opciones}
                    pasoInicial={pasoSiguiente}
                    onPasar={() => {
                        setPasoSiguiente(null);
                        publicar("crear_venta_solicitada");
                    }}
                    onCancelar={() => {
                        setPasoSiguiente(null);
                        if (avanceForzado.current) publicar("crear_venta_solicitada");
                    }}
                />
            )}
        </div>
        </Detalle>
    );
};
