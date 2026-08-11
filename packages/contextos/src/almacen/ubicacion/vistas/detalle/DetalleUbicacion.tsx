import { Zona } from "#/almacen/comun/componentes/Zona.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { Ubicacion } from "../../diseño.ts";
import { patchUbicacion } from "../../infraestructura.ts";
import { BorrarUbicacion } from "./BorrarUbicacion.tsx";
import { metaUbicacion, ubicacionVacia } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { StocksUbicacion } from "./stocks/StocksUbicacion.tsx";

const titulo = (ubicacion: Ubicacion) => ubicacion.codigo as string;

export const DetalleUbicacion = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);

    const { ctx, emitir } = useMaquina(
        getMaquina,
        {
            estado: "INICIAL",
            ubicacion: ubicacionVacia(),
            stocks: [],
        },
        publicar
    );

    const autoGuardar = useCallback(
        async (ubicacion: Ubicacion) => {
            await intentar(() => patchUbicacion(ubicacion.id, ubicacion));
            await emitir("ubicacion_guardada");
        },
        [intentar, emitir]
    );

    const modelo = useModelo(metaUbicacion, ctx.ubicacion, autoGuardar);

    useEffect(() => {
        emitir("ubicacion_id_cambiada", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.ubicacion.id) return null;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.ubicacion}
            cerrarDetalle={() => emitir("ubicacion_deseleccionada", null, true)}
        >
            <div className="DetalleUbicacion">
                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("borrado_solicitado")}>Borrar</QBoton>
                </div>
                <Tabs
                    children={[
                        <Tab key="general" label="General">
                            <quimera-formulario>
                                <QInput label="Código" {...modelo.uiProps("codigo")} />
                                <Zona {...modelo.uiProps("zonaId")} />
                            </quimera-formulario>
                        </Tab>,
                        <Tab key="stock" label="Stock">
                            <StocksUbicacion stocks={ctx.stocks} />
                        </Tab>,
                    ]}
                />
            </div>

            {ctx.estado === "BORRANDO" && (
                <BorrarUbicacion
                    publicar={emitir}
                    ubicacion={ctx.ubicacion}
                />
            )}
        </Detalle>
    );
};
