import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { HookModelo, useModelo } from "@olula/lib/useModelo.ts";
import { ReactNode, useCallback, useContext, useEffect, useMemo } from "react";
import { BorrarSimple } from "./BorrarSimple.tsx";
import { getMaquinaDetalleSimple } from "./maquina_detalle.ts";

export type PropsCamposDetalle<T extends Entidad> = {
    modelo: HookModelo<T>;
    entidad: T;
    /** Vuelve a leer la entidad (tras cambiarla por otra vía que no sea el formulario). */
    recargar: () => Promise<void>;
};

export type PropsDetalleSimple<T extends Entidad> = {
    id?: string;
    publicar?: EmitirEvento;
    /** Clase CSS del formulario. */
    clase: string;
    getUno: (id: string) => Promise<T>;
    /** Guarda la entidad (autoguardado al perder el foco). */
    guardar: (entidad: T) => Promise<void>;
    vacia: () => T;
    meta: MetaModelo<T>;
    titulo: (entidad: T) => string;
    campos: (props: PropsCamposDetalle<T>) => ReactNode;
    tituloBorrar: string;
    mensajeBorrar: (entidad: T) => string;
    borrar: (id: string) => Promise<void>;
};

/** Detalle de un maestro sencillo de producción: formulario con autoguardado y botón Borrar. */
export const DetalleSimple = <T extends Entidad>({
    id,
    publicar = async () => {},
    clase,
    getUno,
    guardar,
    vacia,
    meta,
    titulo,
    campos,
    tituloBorrar,
    mensajeBorrar,
    borrar,
}: PropsDetalleSimple<T>) => {
    const { intentar } = useContext(ContextoError);

    const getMaquina = useMemo(() => getMaquinaDetalleSimple(getUno, vacia), [getUno, vacia]);
    const contextoInicial = useMemo(() => ({ estado: "INICIAL" as const, entidad: vacia() }), [vacia]);

    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial, publicar);

    const autoGuardar = useCallback(
        async (entidad: T) => {
            await intentar(() => guardar(entidad));
            await emitir("entidad_guardada");
        },
        [intentar, emitir, guardar]
    );

    const modelo = useModelo(meta, ctx.entidad, autoGuardar);

    useEffect(() => {
        emitir("id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.entidad.id) return null;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.entidad}
            cerrarDetalle={() => emitir("entidad_deseleccionada", null, true)}
        >
            <div className={clase}>
                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("borrado_solicitado")}>Borrar</QBoton>
                </div>
                {campos({ modelo, entidad: ctx.entidad, recargar: () => emitir("entidad_guardada") })}
            </div>

            {ctx.estado === "BORRANDO" && (
                <BorrarSimple
                    publicar={emitir}
                    titulo={tituloBorrar}
                    mensaje={mensajeBorrar(ctx.entidad)}
                    borrar={() => borrar(ctx.entidad.id)}
                />
            )}
        </Detalle>
    );
};
