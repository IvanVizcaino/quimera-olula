import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarIaMemoria } from "../borrar/BorrarIaMemoria.js";
import { IaMemoria } from "../diseño.js";
import { metaIaMemoria } from "../dominio.js";
import { contextoDetalleIaMemoriaInicial, guardarIaMemoria } from "./detalle.js";
import "./DetalleIaMemoria.css";
import { getMaquina } from "./maquina.js";
import { TabGeneral } from "./TabGeneral.js";
import { TabInformacion } from "./TabInformacion.js";

/**
 * Componente detalle de una memoria del asistente de IA.
 *
 * Recibe el ID como prop (string | undefined), no la entidad completa.
 * La máquina carga la entidad cuando cambia el ID.
 *
 * El formulario se auto-guarda (ver metaIaMemoria.editable en dominio.ts,
 * restringido por la regla "comun.ia_memoria").
 */
export const DetalleIaMemoria = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleIaMemoriaInicial,
        publicar
    );

    // Auto-guardado: se llama cuando el modelo cambia y es válido
    const autoGuardar = useCallback(
        async (iaMemoria: IaMemoria) => {
            await guardarIaMemoria(ctx, iaMemoria);
            await emitir("ia_memoria_guardada");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaIaMemoria, ctx.iaMemoria, autoGuardar);

    const { estado, iaMemoria } = ctx;

    // Recargar cuando el ID cambia (o se deselecciona con undefined)
    useEffect(() => {
        emitir("id_cambiado", id, true);
    }, [id]);

    if (!ctx.iaMemoria.id) return null;

    const titulo = (m: IaMemoria) => m.titulo;

    // Nota: se usa `emitir` (máquina local) y no la prop `publicar` (que notifica
    // al padre), porque estas acciones transicionan/actualizan el estado local.
    const accionesIaMemoria = [
        {
            texto: iaMemoria.activo ? "Desactivar" : "Activar",
            onClick: () => emitir("activo_alternado_solicitado"),
            deshabilitado: !puede("comun.ia_memoria"),
        },
        {
            texto: "Borrar",
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("comun.ia_memoria"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.iaMemoria}
            cerrarDetalle={() => emitir("ia_memoria_deseleccionada", null, true)}
        >
            <div className="DetalleIaMemoria">
                <QuimeraAcciones acciones={accionesIaMemoria} />
                <Tabs children={[
                    <Tab label="General"
                        key="tab-general"
                        children={<TabGeneral form={formModelo} />}
                    />,
                    <Tab label="Información"
                        key="tab-info"
                        children={<TabInformacion iaMemoria={iaMemoria} />}
                    />,
                ]} />
            </div>

            {/* Modales condicionales: se activan según el estado de la máquina */}
            {estado === "BORRANDO" && (
                <BorrarIaMemoria
                    iaMemoria={ctx.iaMemoria}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};
