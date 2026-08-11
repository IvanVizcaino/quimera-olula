import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { Zona } from "../../diseño.ts";
import { patchZona } from "../../infraestructura.ts";
import { BorrarZona } from "../borrar/BorrarZona.js";
import { contextoDetalleZonaInicial, metaZona } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { UbicacionesZona } from "./ubicaciones/UbicacionesZona.js";

const titulo = (zona: Zona) => zona.codigo as string;

export const DetalleZona = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);

    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleZonaInicial, publicar);

    const autoGuardar = useCallback(
        async (zona: Zona) => {
            await intentar(() => patchZona(zona.id, zona));
            await emitir("zona_guardada");
        },
        [intentar, emitir]
    );

    const modelo = useModelo(metaZona, ctx.zona, autoGuardar);

    useEffect(() => {
        emitir("zona_id_cambiada", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.zona.id) return null;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.zona}
            cerrarDetalle={() => emitir("zona_deseleccionada", null, true)}
        >
            <div className="DetalleZona">
                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("borrado_solicitado")}>Borrar</QBoton>
                </div>
                <Tabs
                    children={[
                        <Tab key="general" label="General">
                            <quimera-formulario>
                                <QInput label="Código" {...modelo.uiProps("codigo")} />
                                <Almacen {...modelo.uiProps("almacenId")} />
                                <QInput label="Descripción" {...modelo.uiProps("descripcion")} />
                            </quimera-formulario>
                        </Tab>,
                        <Tab key="ubicaciones" label="Ubicaciones">
                            <UbicacionesZona ubicaciones={ctx.ubicaciones} />
                        </Tab>,
                    ]}
                />
            </div>

            {ctx.estado === "BORRANDO" && (
                <BorrarZona publicar={emitir} zona={ctx.zona} />
            )}
        </Detalle>
    );
};
