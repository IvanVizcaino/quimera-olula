import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect } from "react";
import { BorrarPlanProduccion } from "../borrar/BorrarPlanProduccion.tsx";
import { CabeceraPlanProduccion } from "../diseño.ts";
import { metaCabeceraPlan, rejillaModificada } from "../dominio.ts";
import { PegarExcelPlanProduccion } from "../pegar_excel/PegarExcelPlanProduccion.tsx";
import { contextoDetallePlanInicial, guardarPlan } from "./detalle.ts";
import "./DetallePlanProduccion.css";
import { getMaquina } from "./maquina.ts";
import { RejillaPlanProduccion } from "./rejilla/RejillaPlanProduccion.tsx";
import { TabGeneral } from "./TabGeneral.tsx";

export const DetallePlanProduccion = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetallePlanInicial, publicar);

    // Auto-guardado de la cabecera
    const autoGuardar = useCallback(
        async (cabecera: CabeceraPlanProduccion) => {
            await guardarPlan(ctx, cabecera);
            await emitir("plan_guardado");
        },
        [ctx, emitir]
    );

    const modelo = useModelo(metaCabeceraPlan, ctx.cabecera, autoGuardar);

    useEffect(() => {
        emitir("plan_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.cabecera.id) return null;

    const { estado, cabecera } = ctx;

    return (
        <Detalle
            id={id}
            obtenerTitulo={(p: CabeceraPlanProduccion) => `${p.id} - ${p.descripcion}`}
            setEntidad={() => {}}
            entidad={cabecera}
            cerrarDetalle={() => emitir("plan_deseleccionado", null, true)}
        >
            <div className="DetallePlanProduccion">
                <div className="maestro-botones">
                    <QuimeraAcciones
                        vertical
                        acciones={[
                            {
                                icono: "eliminar",
                                texto: "Borrar",
                                onClick: () => emitir("borrado_solicitado"),
                                advertencia: true,
                            },
                        ]}
                    />
                </div>
                <Tabs
                    children={[
                        <Tab
                            key="tab-general"
                            label="General"
                            children={<TabGeneral form={modelo} />}
                        />,
                        <Tab
                            key="tab-rejilla"
                            label="Rejilla"
                            children={
                                <RejillaPlanProduccion
                                    rejilla={ctx.rejilla}
                                    modificada={rejillaModificada(ctx.lineas, ctx.rejilla)}
                                    publicar={emitir}
                                />
                            }
                        />,
                    ]}
                />
            </div>

            {estado === "BORRANDO" && <BorrarPlanProduccion plan={cabecera} publicar={emitir} />}
            {estado === "PEGANDO_EXCEL" && <PegarExcelPlanProduccion publicar={emitir} />}
        </Detalle>
    );
};
