import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarModulo } from "../borrar/BorrarModulo.js";
import { Modulo } from "../diseño.js";
import { contextoDetalleModuloInicial, guardarModulo, metaModulo } from "./detalle.js";
import "./DetalleModulo.css";
import { getMaquina } from "./maquina.js";
import { TabGeneral } from "./TabGeneral.js";
import { TabInformacion } from "./TabInformacion.js";


/**
 * Componente detalle.
 *
 * Recibe el ID como prop (string | undefined), no la entidad completa.
 * La máquina carga la entidad cuando cambia el ID.
 *
 * Patrón auto-guardado:
 *   useModelo(meta, entidad, onGuardado) → el tercer argumento es un callback
 *   que se invoca cuando el modelo tiene cambios válidos y el usuario deja de editar.
 *   Llama a la API y emite el evento de resultado a la máquina.
 *
 * Patrón modales condicionales:
 *   Los modales se renderizan condicionalmente según ctx.estado.
 *   No existe estado EDITANDO separado; el formulario siempre está activo
 *   y se deshabilita si metaModulo.editable devuelve false.
 */
export const DetalleModulo = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleModuloInicial,
        publicar
    );

    // Auto-guardado: se llama cuando el modelo cambia y es válido
    const autoGuardar = useCallback(
        async (modulo: Modulo) => {
            await guardarModulo(ctx, modulo);
            await emitir("modulo_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaModulo, ctx.modulo, autoGuardar);

    const { estado, modulo } = ctx;

    // Recargar cuando el ID cambia (o se deselecciona con undefined)
    useEffect(() => {
        emitir("modulo_id_cambiado", id, true);
    }, [id]);

    if (!ctx.modulo.id) return null;

    const titulo = (m: Modulo) => m.campoString;

    const accionesModulo = [
        modulo.campoNumero >= 0 && {
            texto: "Accion1",
            onClick: () => publicar("accion_1_solicitada"),
        },
        {
            texto: "Borrar",
            onClick: () => publicar("borrado_solicitado"),
            deshabilitado: !modulo.activo,
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.modulo}
            cerrarDetalle={() => emitir("modulo_deseleccionado", null, true)}
        >
            <div className="DetalleModulo">
                <QuimeraAcciones acciones={accionesModulo} />
                <Tabs children={[
                    <Tab label="General"
                        key="tab-general"
                        children={
                            <TabGeneral
                                form={formModelo}
                                publicar={emitir}
                            />
                        }
                    />,
                    <Tab label="Información"
                        key="tab-info"
                        children={
                            <TabInformacion form={formModelo}
                        />}
                    />,
                    
                ]}/>
            </div>

            {/* Modales condicionales: se activan según el estado de la máquina */}
            {estado === "BORRANDO" && (
                <BorrarModulo
                    modulo={ctx.modulo}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};
