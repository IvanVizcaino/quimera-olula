import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento, Entidad, Modelo } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect, useState } from "react";
import { ConfigMaestroFiscal } from "./diseño.ts";
import { conConfirmacion, deleteUno, getUno, patchUno } from "./infraestructura.ts";

const FormularioFiscal = <T extends Entidad & Modelo, N extends Modelo>({
    config, entidad, onGuardada,
}: {
    config: ConfigMaestroFiscal<T, N>;
    entidad: T;
    onGuardada: () => Promise<void>;
}) => {
    const guardar = useCallback(async (actual: T) => {
        const cambios = config.cambiosAApi(entidad, actual);
        if (Object.keys(cambios).length === 0) return;
        const hecho = await conConfirmacion(
            (extra) => patchUno(config, entidad.id, { ...cambios, ...extra }).then(() => true),
            config.confirmacion,
        );
        if (hecho) await onGuardada();
    }, [config, entidad, onGuardada]);

    const { uiProps } = useModelo(config.metaEntidad, entidad, guardar);
    const Campos = config.Campos;
    const codigo = <QInput label="Código" nombre="id" valor={entidad.id} soloLectura />;

    return (
        <quimera-formulario>
            {!config.codigoEnCampos && codigo}
            <Campos uiProps={uiProps} entidad={entidad}
                codigo={config.codigoEnCampos ? codigo : undefined} />
        </quimera-formulario>
    );
};

/** Ficha de un maestro de Fiscalidad; guarda cada campo al salir de él. */
export const DetalleFiscal = <T extends Entidad & Modelo, N extends Modelo>({
    config, id, publicar,
}: {
    config: ConfigMaestroFiscal<T, N>;
    id?: string;
    publicar: EmitirEvento;
}) => {
    const [entidad, setEntidad] = useState<T | null>(null);
    const [version, setVersion] = useState(0);
    const [borrando, setBorrando] = useState(false);

    useEffect(() => {
        let vigente = true;
        setEntidad(null);
        if (id) getUno(config, id).then((e) => { if (vigente) setEntidad(e); });
        return () => { vigente = false; };
    }, [config, id]);

    const refrescar = useCallback(async () => {
        if (!id) return;
        const nueva = await getUno(config, id);
        setEntidad(nueva);
        setVersion((v) => v + 1);
        await publicar("entidad_cambiada", nueva);
    }, [config, id, publicar]);

    const borrar = useCallback(async () => {
        if (!entidad) return;
        await deleteUno(config, entidad.id);
        setBorrando(false);
        await publicar("entidad_borrada", entidad);
    }, [config, entidad, publicar]);

    if (!id || !entidad) return null;

    return (
        <Detalle
            id={id}
            obtenerTitulo={(e: T) => e.id}
            setEntidad={() => {}}
            entidad={entidad}
            cerrarDetalle={() => publicar("entidad_deseleccionada", null)}
        >
            <div className="DetalleFiscal">
                <div className="maestro-botones">
                    <QuimeraAcciones vertical acciones={[{
                        texto: "Borrar",
                        onClick: () => setBorrando(true),
                        deshabilitado: !puede(config.regla),
                        advertencia: true,
                    }]} />
                </div>
                <FormularioFiscal key={`${entidad.id}-${version}`} config={config}
                    entidad={entidad} onGuardada={refrescar} />
            </div>
            {borrando && (
                <QModalConfirmacion
                    nombre={`borrar_${config.nombre}`}
                    abierto={true}
                    titulo={`Borrar ${config.nombre}`}
                    mensaje={`¿Confirma borrar ${config.nombre} ${entidad.id}? ${config.avisoBorrado ?? "No se puede borrar si está en uso."}`}
                    onCerrar={() => setBorrando(false)}
                    onAceptar={borrar}
                />
            )}
        </Detalle>
    );
};
