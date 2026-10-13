import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { remesaPagoPuedeExportFicheroBanco } from "../dominio.js";
import { RemesaPago } from "../diseño.js";
import { DescargarFicheroBancoRemesaPago } from "./DescargarFicheroBancoRemesaPago.js";
import { contextoDetalleRemesaPagoInicial, metaRemesaPago } from "./detalle.js";
import "./DetalleRemesaPago.css";
import { getMaquina } from "./maquina.js";
import { DeshacerPagoRemesaPago } from "./deshacer_pago/DeshacerPagoRemesaPago.js";
import { PagarRemesaPago } from "./pagar/PagarRemesaPago.js";
import { PagosRemesaPago } from "./pagos/PagosRemesaPago.js";
import { AsociarRecibosRemesaPago } from "./recibos/AsociarRecibosRemesaPago.js";
import { ExcluirReciboRemesaPago } from "./recibos/ExcluirReciboRemesaPago.js";
import { RecibosRemesaPago } from "./recibos/RecibosRemesaPago.js";
import { TabGeneral } from "./TabGeneral.js";

export const DetalleRemesaPago = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleRemesaPagoInicial,
        publicar
    );

    const formModelo = useModelo(metaRemesaPago, ctx.remesa);

    useEffect(() => {
        emitir("remesa_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.remesa.id) return null;

    const titulo = (r: RemesaPago) => `Remesa de pago ${r.id}`;
    const mostrarExportBanco =
        pluginActivo("norma34_remesa_pago") &&
        remesaPagoPuedeExportFicheroBanco(ctx.remesa);

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.remesa}
            cerrarDetalle={() => emitir("remesa_deseleccionada", null, true)}
        >
            <div className="DetalleRemesaPago">
                {mostrarExportBanco && (
                    <DescargarFicheroBancoRemesaPago remesa={ctx.remesa} />
                )}
                <Tabs children={[
                    <Tab label="General"
                        key="tab-general"
                        children={<TabGeneral form={formModelo} />}
                    />,
                    <Tab label={`Recibos (${ctx.remesa.recibos.length})`}
                        key="tab-recibos"
                        children={
                            <RecibosRemesaPago remesa={ctx.remesa} publicar={emitir} />
                        }
                    />,
                    <Tab label={`Pagos (${ctx.remesa.pagos.length})`}
                        key="tab-pagos"
                        children={
                            <PagosRemesaPago remesa={ctx.remesa} publicar={emitir} />
                        }
                    />,
                ]} />

                {ctx.estado === "PAGANDO" && <PagarRemesaPago publicar={emitir} />}

                {ctx.estado === "DESHACIENDO_PAGO" && (
                    <DeshacerPagoRemesaPago remesa={ctx.remesa} publicar={emitir} />
                )}

                {ctx.estado === "ASOCIANDO_RECIBOS" && (
                    <AsociarRecibosRemesaPago remesa={ctx.remesa} publicar={emitir} />
                )}

                {ctx.estado === "EXCLUYENDO_RECIBO" && ctx.reciboExcluirId && (() => {
                    const recibo = ctx.remesa.recibos.find(
                        (r) => r.id === ctx.reciboExcluirId
                    );
                    if (!recibo) return null;
                    return (
                        <ExcluirReciboRemesaPago
                            remesa={ctx.remesa}
                            recibo={recibo}
                            publicar={emitir}
                        />
                    );
                })()}
            </div>
        </Detalle>
    );
};
