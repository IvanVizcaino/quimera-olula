import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useEffect } from "react";
import { Grupo } from "../diseño.ts";
import { grupoVacio, metaGrupo } from "../dominio.ts";
import { patchGrupo } from "../infraestructura.ts";
import { ReglasGrupo } from "./ReglasGrupo.tsx";
import "./DetalleGrupo.css";

export const DetalleGrupo = ({
    grupoSeleccionado,
    publicar = async () => {},
}: {
    grupoSeleccionado: Grupo | null;
    publicar?: EmitirEvento;
}) => {
    const grupoBase = grupoSeleccionado ?? grupoVacio;
    const { modelo, modificado, uiProps, valido, init } = useModelo(metaGrupo, grupoBase);

    useEffect(() => {
        init(grupoBase);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grupoSeleccionado?.id]);

    const guardar = async () => {
        if (!grupoSeleccionado) return;
        await patchGrupo(grupoSeleccionado.id, { nombre: modelo.nombre });
        const grupoActualizado: Grupo = { ...grupoSeleccionado, nombre: modelo.nombre };
        publicar("grupo_actualizado", grupoActualizado);
    };

    if (!grupoSeleccionado) return null;

    return (
        <div className="DetalleGrupo">
            <div className="DetalleGrupo-cabecera">
                <quimera-formulario>
                    <QInput label="Nombre" {...uiProps("nombre")} />
                </quimera-formulario>
                {modificado && (
                    <div className="botones maestro-botones">
                        <QBoton onClick={guardar} deshabilitado={!valido}>
                            Guardar
                        </QBoton>
                        <QBoton
                            variante="texto"
                            onClick={() => init(grupoBase)}
                        >
                            Cancelar
                        </QBoton>
                    </div>
                )}
            </div>
            <ReglasGrupo grupoSeleccionado={grupoSeleccionado} />
        </div>
    );
};
