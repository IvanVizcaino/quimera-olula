import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { AgenteTpv } from "../diseño.ts";
import { patchAgenteTpv } from "../infraestructura.ts";
import { BorrarAgenteTpv } from "../borrar/BorrarAgenteTpv.tsx";
import { agenteVacioDetalle, metaAgenteTpv } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";

const titulo = (a: AgenteTpv) => a.nombre;

export const DetalleAgenteTpv = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);

    const vacia = agenteVacioDetalle();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        { estado: "INICIAL", agente: vacia, agenteInicial: vacia },
        publicar,
    );

    const form = useModelo(metaAgenteTpv, ctx.agente);

    useEffect(() => {
        emitir("agente_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const guardar = useCallback(async () => {
        await intentar(() => patchAgenteTpv(form.modelo.id, { nombre: form.modelo.nombre }));
        emitir("agente_guardado");
    }, [emitir, form, intentar]);

    const cancelar = useCallback(() => emitir("cancelar_edicion"), [emitir]);

    if (!ctx.agente.id) return null;

    return (
        <Detalle
            id={ctx.agente.id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.agente}
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
                                <QInput label="Código" nombre="id" valor={ctx.agente.id} soloLectura />
                                <QInput label="Nombre" {...form.uiProps("nombre")} />
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
                <BorrarAgenteTpv
                    publicar={emitir}
                    activo={ctx.estado === "Borrando"}
                    agente={ctx.agente}
                />
            </>
        </Detalle>
    );
};
