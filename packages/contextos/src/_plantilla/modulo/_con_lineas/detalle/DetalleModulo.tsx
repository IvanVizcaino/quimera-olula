import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { listaEntidadesInicial } from "@olula/lib/ListaEntidades.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarModulo } from "../../borrar/BorrarModulo.js";
import { TabGeneral } from "../../detalle/TabGeneral.js";
import { TabInformacion } from "../../detalle/TabInformacion.js";
import { LineaModulo, ModLin } from "../diseño.js";
import { guardarModLin, metaModLin, modLinVacio } from "./detalle.js";
import "./DetalleModulo.css";
import { ContextoDetalleModLin } from "./maquina.js";
import { LineasModulo } from "./lineas/LineasModulo.js";
import { getMaquina } from "./maquina.js";

export const DetalleModulo = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const contextoInicial: ContextoDetalleModLin = {
        estado: "INICIAL",
        modLin: modLinVacio(),
        lineas: listaEntidadesInicial<LineaModulo>(),
    };

    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial, publicar);

    const autoGuardar = useCallback(
        async (modLin: ModLin) => {
            await guardarModLin(ctx, modLin);
            await emitir("modulo_guardado");
        },
        [ctx, emitir]
    );

    const modelo = useModelo(metaModLin, ctx.modLin, autoGuardar);

    useEffect(() => {
        emitir("modulo_id_cambiado", id, true);
    }, [id]);

    if (!ctx.modLin.id) return null;

    const titulo = (m: ModLin) => m.campoString as string;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.modLin}
            cerrarDetalle={() => emitir("modulo_deseleccionado", null, true)}
        >
            <div className="DetalleModulo">
                <QuimeraAcciones acciones={[
                    {
                        texto: "Borrar",
                        onClick: () => emitir("borrado_solicitado"),
                        advertencia: true,
                    },
                ]} />
                <Tabs
                    children={[
                        <Tab
                            key="tab-general"
                            label="General"
                            children={<TabGeneral form={modelo} publicar={emitir}/>}
                        />,
                        <Tab
                            key="tab-info"
                            label="Información"
                            children={<TabInformacion form={modelo} />}
                        />,
                    ]}
                />
                <LineasModulo
                    modLin={ctx.modLin}
                    lineas={ctx.lineas}
                    estado={ctx.estado}
                    publicar={emitir}
                />
            </div>

            {ctx.estado === "BORRANDO" && (
                <BorrarModulo
                    modulo={ctx.modLin}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};
