import { Familia } from "#/almacen/comun/componentes/Familia.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { Subfamilia } from "../diseño.ts";
import { patchSubfamilia } from "../infraestructura.ts";
import { BorrarSubfamilia } from "../borrar/BorrarSubfamilia.tsx";
import { subfamiliaVaciaDetalle, metaSubfamilia } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";

const titulo = (s: Subfamilia) => s.descripcion;

export const DetalleSubfamilia = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);

    const vacia = subfamiliaVaciaDetalle();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        { estado: "INICIAL", subfamilia: vacia, subfamiliaInicial: vacia },
        publicar,
    );

    const form = useModelo(metaSubfamilia, ctx.subfamilia);

    useEffect(() => {
        emitir("subfamilia_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const guardar = useCallback(async () => {
        await intentar(() => patchSubfamilia(form.modelo.id, { descripcion: form.modelo.descripcion }));
        emitir("subfamilia_guardada");
    }, [emitir, form, intentar]);

    const cancelar = useCallback(() => emitir("cancelar_edicion"), [emitir]);

    if (!ctx.subfamilia.id) return null;

    return (
        <Detalle
            id={ctx.subfamilia.id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.subfamilia}
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
                                <QInput label="Código" nombre="id" valor={ctx.subfamilia.id} soloLectura />
                                <QInput label="Descripción" {...form.uiProps("descripcion")} />
                                <Familia nombre="familiaId" label="Familia" valor={ctx.subfamilia.familiaId} soloLectura />
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
                <BorrarSubfamilia
                    publicar={emitir}
                    activo={ctx.estado === "Borrando"}
                    subfamilia={ctx.subfamilia}
                />
            </>
        </Detalle>
    );
};
