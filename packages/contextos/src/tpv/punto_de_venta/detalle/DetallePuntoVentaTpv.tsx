import { AgenteTpv } from "#/tpv/comun/componentes/AgenteTpv.tsx";
import { TiendaTpv } from "#/tpv/comun/componentes/TiendaTpv.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { PuntoVentaTpv } from "../diseño.ts";
import { metaPuntoVentaTpv, puntoVentaVacioDetalle } from "../dominio.ts";
import { patchPuntoVentaTpv } from "../infraestructura.ts";
import { BorrarPuntoVentaTpv } from "../borrar/BorrarPuntoVentaTpv.tsx";
import { getMaquina } from "./maquina.ts";

const titulo = (p: PuntoVentaTpv) => p.nombre;

export const DetallePuntoVentaTpv = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);

    const vacia = puntoVentaVacioDetalle();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        { estado: "INICIAL", punto: vacia, puntoInicial: vacia },
        publicar,
    );

    const form = useModelo(metaPuntoVentaTpv, ctx.punto);

    useEffect(() => {
        emitir("punto_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const guardar = useCallback(async () => {
        await intentar(() =>
            patchPuntoVentaTpv(form.modelo.id, {
                nombre: form.modelo.nombre,
                serieId: form.modelo.serieId ?? undefined,
                tiendaId: form.modelo.tiendaId ?? undefined,
                agenteId: form.modelo.agenteId,
            }),
        );
        emitir("punto_guardado");
    }, [emitir, form, intentar]);

    const cancelar = useCallback(() => emitir("cancelar_edicion"), [emitir]);

    if (!ctx.punto.id) return null;

    return (
        <Detalle
            id={ctx.punto.id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.punto}
            cerrarDetalle={() => emitir("cancelar_seleccion")}
        >
            <>
                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("borrar")}>Borrar</QBoton>
                </div>
                <Tabs
                    children={[
                        <Tab key="general" label="General">
                            <quimera-formulario>
                                <QInput label="Código" nombre="id" valor={ctx.punto.id} soloLectura />
                                <QInput label="Nombre" {...form.uiProps("nombre")} />
                                <QInput label="Serie" {...form.uiProps("serieId")} />
                                <TiendaTpv
                                    label="Tienda"
                                    {...form.uiProps("tiendaId")}
                                    nombre="tienda_id"
                                />
                                <AgenteTpv
                                    label="Agente por defecto"
                                    {...form.uiProps("agenteId")}
                                    nombre="agente_id"
                                />
                            </quimera-formulario>
                        </Tab>,
                    ]}
                />
                {form.modificado && (
                    <div className="botones maestro-botones">
                        <QBoton onClick={guardar} deshabilitado={!form.valido}>Guardar</QBoton>
                        <QBoton tipo="reset" variante="texto" onClick={cancelar} deshabilitado={!form.modificado}>Cancelar</QBoton>
                    </div>
                )}
                <BorrarPuntoVentaTpv
                    publicar={emitir}
                    activo={ctx.estado === "Borrando"}
                    punto={ctx.punto}
                />
            </>
        </Detalle>
    );
};
