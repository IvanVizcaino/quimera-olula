import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { UnidadMedida } from "../diseño.ts";
import { patchUnidadMedida } from "../infraestructura.ts";
import { BorrarUnidadMedida } from "../borrar/BorrarUnidadMedida.tsx";
import { metaUnidadMedida, unidadMedidaVaciaDetalle } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";

const titulo = (u: UnidadMedida) => u.descripcion || u.id;

export const DetalleUnidadMedida = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);

    const vacia = unidadMedidaVaciaDetalle();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        { estado: "INICIAL", unidad: vacia, unidadInicial: vacia },
        publicar,
    );

    const form = useModelo(metaUnidadMedida, ctx.unidad);

    useEffect(() => {
        emitir("unidad_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const guardar = useCallback(async () => {
        await intentar(() =>
            patchUnidadMedida(form.modelo.id, {
                descripcion: form.modelo.descripcion,
                magnitud: form.modelo.magnitud,
                factorConv: form.modelo.factorConv,
            }),
        );
        emitir("unidad_guardada");
    }, [emitir, form, intentar]);

    const cancelar = useCallback(() => emitir("cancelar_edicion"), [emitir]);

    if (!ctx.unidad.id) return null;

    return (
        <Detalle
            id={ctx.unidad.id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.unidad}
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
                                <QInput label="Código" nombre="id" valor={ctx.unidad.id} soloLectura />
                                <QInput label="Descripción" {...form.uiProps("descripcion")} />
                                <QInput label="Magnitud" {...form.uiProps("magnitud")} />
                                <QInput label="Factor de conversión" {...form.uiProps("factorConv")} />
                            </quimera-formulario>
                        </Tab>,
                    ]}
                />
                {form.modificado && (
                    <div className="botones maestro-botones">
                        <QBoton onClick={guardar} deshabilitado={!form.valido}>Guardar</QBoton>
                        <QBoton tipo="reset" variante="texto" onClick={cancelar} deshabilitado={!form.modificado}>
                            Cancelar
                        </QBoton>
                    </div>
                )}
                <BorrarUnidadMedida
                    publicar={emitir}
                    activo={ctx.estado === "Borrando"}
                    unidad={ctx.unidad}
                />
            </>
        </Detalle>
    );
};
