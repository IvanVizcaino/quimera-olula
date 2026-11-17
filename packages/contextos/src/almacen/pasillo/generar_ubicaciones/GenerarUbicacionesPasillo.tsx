import { TipoUbicacion } from "#/almacen/comun/componentes/TipoUbicacion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useState } from "react";
import { Pasillo, ResultadoGenerarUbicaciones } from "../diseño.ts";
import {
    mensajeUbicacionesGeneradas,
    metaGenerarUbicaciones,
    parametrosGenerarUbicacionesIniciales,
} from "../dominio.ts";
import { generarUbicacionesPasillo } from "../infraestructura.ts";

/**
 * Modal de generación de ubicaciones de un pasillo. Tras generar muestra cuántas se han
 * creado; al cerrarlo avisa con "ubicaciones_generadas" para que se refresquen las de la zona.
 */
export const GenerarUbicacionesPasillo = ({
    pasillo,
    publicar,
}: {
    pasillo: Pasillo;
    publicar: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const { modelo, uiProps, valido } = useModelo(
        metaGenerarUbicaciones,
        parametrosGenerarUbicacionesIniciales
    );
    const [resultado, setResultado] = useState<ResultadoGenerarUbicaciones | null>(null);

    const generar = useCallback(async () => {
        const r = await intentar(() => generarUbicacionesPasillo(pasillo.id, modelo));
        setResultado(r);
    }, [intentar, pasillo.id, modelo]);

    const cerrar = useCallback(
        () => publicar(resultado ? "ubicaciones_generadas" : "generacion_cancelada"),
        [publicar, resultado]
    );

    return (
        <QModal
            abierto={true}
            nombre="generarUbicacionesPasillo"
            titulo={`Generar ubicaciones del pasillo ${pasillo.codigo}`}
            onCerrar={cerrar}
        >
            <quimera-formulario>
                <QInput label="Nivel desde" {...uiProps("nivelDesde")} />
                <QInput label="Nivel hasta" {...uiProps("nivelHasta")} />
                <QInput label="Huecos por nivel" {...uiProps("huecosPorNivel")} />
                <TipoUbicacion {...uiProps("tipoUbicacionId")} />
                <QInput label="Módulo desde (opcional)" {...uiProps("moduloDesde")} />
                <QInput label="Módulo hasta (opcional)" {...uiProps("moduloHasta")} />
            </quimera-formulario>
            {resultado && (
                <p className="resultado-generacion">
                    {mensajeUbicacionesGeneradas(resultado.creadas)}
                </p>
            )}
            <div className="botones maestro-botones">
                <QBoton onClick={generar} deshabilitado={!valido}>
                    Generar
                </QBoton>
                {resultado && <QBoton onClick={cerrar}>Cerrar</QBoton>}
            </div>
        </QModal>
    );
};
